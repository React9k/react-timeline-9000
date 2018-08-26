'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import {Grid, AutoSizer, defaultCellRangeRenderer} from 'react-virtualized';

import moment from 'moment';
import interact from 'interactjs';
import _ from 'lodash';

import {pixToInt, intToPix, sumStyle} from './utils/commonUtils';
import {rowItemsRenderer, getNearestRowHeight, getMaxOverlappingItems} from './utils/itemUtils';
import {timeSnap, getTimeAtPixel, getPixelAtTime, getSnapPixelFromDelta, pixelsPerMinute} from './utils/timeUtils';
import Timebar from './components/timebar';
import SelectBox from './components/selector';
import {DefaultGroupRenderer, DefaultItemRenderer} from './components/renderers';

// startsWith polyfill for IE11 support
import 'core-js/fn/string/starts-with';

import './style.css';

/**
 * Timeline class
 * @reactProps {!number} items - this is prop1
 * @reactProps {string} prop2 - this is prop2
 */
export default class Timeline extends React.Component {
  /**
   * @type {object}
   */
  static TIMELINE_MODES = Object.freeze({
    SELECT: 1,
    DRAG: 2,
    RESIZE: 4
  });

  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    groups: PropTypes.arrayOf(PropTypes.object).isRequired,
    groupOffset: PropTypes.number.isRequired,
    selectedItems: PropTypes.arrayOf(PropTypes.number),
    startDate: PropTypes.object.isRequired,
    endDate: PropTypes.object.isRequired,
    snapMinutes: PropTypes.number,
    showCursorTime: PropTypes.bool,
    cursorTimeFormat: PropTypes.string,
    itemHeight: PropTypes.number,
    timelineMode: PropTypes.number,
    timebarFormat: PropTypes.object,
    onItemClick: PropTypes.func,
    onItemDoubleClick: PropTypes.func,
    onItemContext: PropTypes.func,
    onInteraction: PropTypes.func.isRequired,
    onRowClick: PropTypes.func,
    onRowContext: PropTypes.func,
    onRowDoubleClick: PropTypes.func,
    itemRenderer: PropTypes.func,
    groupRenderer: PropTypes.func,
    onItemHover: PropTypes.func,
    onItemLeave: PropTypes.func
  };

  static defaultProps = {
    groupOffset: 150,
    itemHeight: 40,
    snapMinutes: 15,
    cursorTimeFormat: '[Day] DDD - HH:mm',
    showCursorTime: true,
    groupRenderer: DefaultGroupRenderer,
    itemRenderer: DefaultItemRenderer,
    timelineMode: Timeline.TIMELINE_MODES.SELECT | Timeline.TIMELINE_MODES.DRAG | Timeline.TIMELINE_MODES.RESIZE,
    onItemHover() {},
    onItemLeave() {}
  };

  /**
   * The types of interactions - see {@link onInteraction}
   */
  static changeTypes = {
    resizeStart: 'resizeStart',
    resizeEnd: 'resizeEnd',
    dragEnd: 'dragEnd',
    dragStart: 'dragStart',
    itemsSelected: 'itemsSelected',
    snappedMouseMove: 'snappedMouseMove'
  };

  /**
   * Checks if the given bit is set in the given mask
   * @param {number} bit Bit to check
   * @param {number} mask Mask to check against
   * @returns {boolean} True if bit is set; else false
   */
  static isBitSet(bit, mask) {
    return (bit & mask) === bit;
  }

  /**
   * Alias for no op function
   */
  static no_op = () => {};

  constructor(props) {
    super(props);
    this.selecting = false;
    this.state = {selection: [], cursorTime: null};
    this.setTimeMap(this.props.items);

    this.cellRenderer = this.cellRenderer.bind(this);
    this.cellRangeRenderer = this.cellRangeRenderer.bind(this);
    this.rowHeight = this.rowHeight.bind(this);
    this.setTimeMap = this.setTimeMap.bind(this);
    this.getItem = this.getItem.bind(this);
    this.changeGroup = this.changeGroup.bind(this);
    this.setSelection = this.setSelection.bind(this);
    this.clearSelection = this.clearSelection.bind(this);
    this.getTimelineWidth = this.getTimelineWidth.bind(this);
    this.itemFromElement = this.itemFromElement.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
    this.grid_ref_callback = this.grid_ref_callback.bind(this);
    this.select_ref_callback = this.select_ref_callback.bind(this);
    this.mouseMoveFunc = this.mouseMoveFunc.bind(this);
    this.getCursor = this.getCursor.bind(this);

    const canSelect = Timeline.isBitSet(Timeline.TIMELINE_MODES.SELECT, this.props.timelineMode);
    const canDrag = Timeline.isBitSet(Timeline.TIMELINE_MODES.DRAG, this.props.timelineMode);
    const canResize = Timeline.isBitSet(Timeline.TIMELINE_MODES.RESIZE, this.props.timelineMode);
    this.setUpDragging(canSelect, canDrag, canResize);
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions);
  }
  componentWillReceiveProps(nextProps) {
    this.setTimeMap(nextProps.items, nextProps.startDate, nextProps.endDate);
    // @TODO
    // investigate if we need this, only added to refresh the grid
    // when double click -> add an item
    this.refreshGrid();
    if (this.props.timelineMode !== nextProps.timelineMode) {
      const canSelect = Timeline.isBitSet(Timeline.TIMELINE_MODES.SELECT, nextProps.timelineMode);
      const canDrag = Timeline.isBitSet(Timeline.TIMELINE_MODES.DRAG, nextProps.timelineMode);
      const canResize = Timeline.isBitSet(Timeline.TIMELINE_MODES.RESIZE, nextProps.timelineMode);
      this.setUpDragging(canSelect, canDrag, canResize);
    }
  }
  componentWillUnmount() {
    if (this._itemInteractable) this._itemInteractable.unset();
    if (this._selectRectangleInteractable) this._selectRectangleInteractable.unset();

    window.removeEventListener('resize', this.updateDimensions);
  }

  /**
   * Re-renders the grid when the window or container is resized
   */
  updateDimensions() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.forceUpdate();
      this._grid.recomputeGridSize();
    }, 100);
  }

  /**
   * Sets the internal maps used by the component for looking up item & row data
   * @param {Object[]} items The items to be displayed in the grid
   * @param {moment} startDate The visible start date of the timeline
   * @param {moment} endDate The visible end date of the timeline
   */
  setTimeMap(items, startDate, endDate) {
    if (!startDate || !endDate) {
      startDate = this.props.startDate;
      endDate = this.props.endDate;
    }
    this.itemRowMap = {}; // timeline elements (key) => (rowNo).
    this.rowItemMap = {}; // (rowNo) => timeline elements
    this.rowHeightCache = {}; // (rowNo) => max number of stacked items
    let visibleItems = _.filter(items, i => {
      return i.end > startDate && i.start < endDate;
    });
    let itemRows = _.groupBy(visibleItems, 'row');
    _.forEach(itemRows, (visibleItems, row) => {
      const rowInt = parseInt(row);
      if (this.rowItemMap[rowInt] === undefined) this.rowItemMap[rowInt] = [];
      _.forEach(visibleItems, item => {
        this.itemRowMap[item.key] = rowInt;
        this.rowItemMap[rowInt].push(item);
      });
      this.rowHeightCache[rowInt] = getMaxOverlappingItems(visibleItems);
    });
  }

  /**
   * Returns an item given its DOM element
   * @param {Object} e the DOM element of the item
   * @return {Object} Item details
   * @prop {number|string} index The item's index
   * @prop {number} rowNo The row number the item is in
   * @prop {number} itemIndex Not really used - gets the index of the item in the row map
   * @prop {Object} item The provided item object
   */
  itemFromElement(e) {
    const index = e.getAttribute('data-item-index');
    const rowNo = this.itemRowMap[index];
    const itemIndex = _.findIndex(this.rowItemMap[rowNo], i => i.key == index);
    const item = this.rowItemMap[rowNo][itemIndex];

    return {index, rowNo, itemIndex, item};
  }

  /**
   * Gets an item given its ID
   * @param {number} id item id
   * @return {Object} Item object
   */
  getItem(id) {
    // This is quite stupid and shouldn't really be needed
    const rowNo = this.itemRowMap[id];
    const itemIndex = _.findIndex(this.rowItemMap[rowNo], i => i.key == id);
    return this.rowItemMap[rowNo][itemIndex];
  }

  /**
   * Move an item from one row to another
   * @param {object} item The item object whose groups is to be changed
   * @param {number} curRow The item's current row index
   * @param {number} newRow The item's new row index
   */
  changeGroup(item, curRow, newRow) {
    item.row = newRow;
    this.itemRowMap[item.key] = newRow;
    this.rowItemMap[curRow] = this.rowItemMap[curRow].filter(i => i.key !== item.key);
    this.rowItemMap[newRow].push(item);
  }

  /**
   * Set the currently selected time ranges (for the timebar to display)
   * @param {Object[]} selections Of the form `[[start, end], [start, end], ...]`
   */
  setSelection(selections) {
    let newSelection = _.map(selections, s => {
      return {start: s[0].clone(), end: s[1].clone()};
    });
    this.setState({selection: newSelection});
  }

  /**
   * Clears the currently selected time range state
   */
  clearSelection() {
    this.setState({selection: []});
  }

  /**
   * Get the width of the timeline NOT including the left group list
   * @param {?number} totalWidth Total timeline width. If not supplied we use the timeline ref
   * @returns {number} The width in pixels
   */
  getTimelineWidth(totalWidth) {
    const {groupOffset} = this.props;
    if (totalWidth !== undefined) return totalWidth - groupOffset;
    return this._grid.props.width - groupOffset;
  }

  /**
   * re-computes the grid's row sizes
   * @param {Object?} config Config to pass wo react-virtualized's compute func
   */
  refreshGrid = (config = {}) => {
    this._grid.recomputeGridSize(config);
  };

  setUpDragging(canSelect, canDrag, canResize) {
    if (this._itemInteractable) this._itemInteractable.unset();
    if (this._selectRectangleInteractable) this._selectRectangleInteractable.unset();

    this._itemInteractable = interact('.item_draggable');
    this._selectRectangleInteractable = interact('.parent-div');

    this._itemInteractable.on('tap', e => {
      this._handleItemRowEvent(e, this.props.onItemClick, this.props.onRowClick);
    });

    if (canDrag) {
      this._itemInteractable
        .draggable({
          enabled: true
        })
        .on('dragstart', e => {
          let selections = [];
          const animatedItems = this.props.onInteraction(
            Timeline.changeTypes.dragStart,
            null,
            this.props.selectedItems
          );

          _.forEach(animatedItems, id => {
            let domItem = document.querySelector("span[data-item-index='" + id + "'");
            if (domItem) {
              selections.push([this.getItem(id).start, this.getItem(id).end]);
              domItem.setAttribute('isDragging', 'True');
              domItem.setAttribute('drag-x', 0);
              domItem.setAttribute('drag-y', 0);
              domItem.style['z-index'] = 3;
            }
          });
          this.setSelection(selections);
        })
        .on('dragmove', e => {
          const target = e.target;
          let animatedItems = document.querySelectorAll("span[isDragging='True'") || [];

          let dx = (parseFloat(target.getAttribute('drag-x')) || 0) + e.dx;
          let dy = (parseFloat(target.getAttribute('drag-y')) || 0) + e.dy;
          let selections = [];

          // Snap the movement to the current snap interval
          const snapDx = getSnapPixelFromDelta(
            dx,
            this.props.startDate,
            this.props.endDate,
            this.getTimelineWidth(),
            this.props.snapMinutes
          );

          _.forEach(animatedItems, domItem => {
            const {item} = this.itemFromElement(domItem);
            let itemDuration = item.end.diff(item.start);
            let newPixelOffset = pixToInt(domItem.style.left) + snapDx;
            let newStart = getTimeAtPixel(
              newPixelOffset,
              this.props.startDate,
              this.props.endDate,
              this.getTimelineWidth(),
              this.props.snapMinutes
            );

            let newEnd = newStart.clone().add(itemDuration);
            selections.push([newStart, newEnd]);

            // Translate the new start time back to pixels, so we can animate the snap
            domItem.style.webkitTransform = domItem.style.transform = 'translate(' + snapDx + 'px, ' + dy + 'px)';
          });

          target.setAttribute('drag-x', dx);
          target.setAttribute('drag-y', dy);

          this.setSelection(selections);
        })
        .on('dragend', e => {
          const {item, rowNo} = this.itemFromElement(e.target);
          let animatedItems = document.querySelectorAll("span[isDragging='True'") || [];

          this.setSelection([[item.start, item.end]]);
          this.clearSelection();

          // Change row
          // console.log('From row', rowNo);
          let newRow = getNearestRowHeight(e.clientX, e.clientY);
          // console.log('To row', newRow);

          let rowChangeDelta = newRow - rowNo;
          // Update time
          let newPixelOffset = pixToInt(e.target.style.left) + (parseFloat(e.target.getAttribute('drag-x')) || 0);
          let newStart = getTimeAtPixel(
            newPixelOffset,
            this.props.startDate,
            this.props.endDate,
            this.getTimelineWidth(),
            this.props.snapMinutes
          );

          const timeDelta = newStart.clone().diff(item.start, 'minutes');
          const changes = {rowChangeDelta, timeDelta};
          let items = [];

          // Default, all items move by the same offset during a drag
          _.forEach(animatedItems, domItem => {
            const {item, rowNo} = this.itemFromElement(domItem);

            let itemDuration = item.end.diff(item.start);
            let newStart = item.start.clone().add(timeDelta, 'minutes');
            let newEnd = newStart.clone().add(itemDuration);
            item.start = newStart;
            item.end = newEnd;
            if (rowChangeDelta < 0) {
              item.row = Math.max(0, item.row + rowChangeDelta);
            } else if (rowChangeDelta > 0) {
              item.row = Math.min(this.props.groups.length - 1, item.row + rowChangeDelta);
            }

            items.push(item);
          });

          this.props.onInteraction(Timeline.changeTypes.dragEnd, changes, items);

          // Reset the styles
          animatedItems.forEach(domItem => {
            domItem.style.webkitTransform = domItem.style.transform = 'translate(0px, 0px)';
            domItem.setAttribute('drag-x', 0);
            domItem.setAttribute('drag-y', 0);
            domItem.style['z-index'] = 2;
            domItem.style['top'] = intToPix(
              this.props.itemHeight * Math.round(pixToInt(domItem.style['top']) / this.props.itemHeight)
            );
            domItem.removeAttribute('isDragging');
          });

          this._grid.recomputeGridSize({rowIndex: 0});
        });
    }
    if (canResize) {
      this._itemInteractable
        .resizable({
          edges: {left: true, right: true, bottom: false, top: false}
        })
        .on('resizestart', e => {
          const selected = this.props.onInteraction(Timeline.changeTypes.resizeStart, null, this.props.selectedItems);
          _.forEach(selected, id => {
            let domItem = document.querySelector("span[data-item-index='" + id + "'");
            if (domItem) {
              domItem.setAttribute('isResizing', 'True');
              domItem.setAttribute('initialWidth', pixToInt(domItem.style.width));
              domItem.style['z-index'] = 3;
            }
          });
        })
        .on('resizemove', e => {
          let animatedItems = document.querySelectorAll("span[isResizing='True'") || [];

          let dx = parseFloat(e.target.getAttribute('delta-x')) || 0;
          dx += e.deltaRect.left;

          let dw = e.rect.width - Number(e.target.getAttribute('initialWidth'));

          const minimumWidth =
            pixelsPerMinute(this.props.startDate, this.props.endDate, this.getTimelineWidth()) * this.props.snapMinutes;

          const snappedDx = getSnapPixelFromDelta(
            dx,
            this.props.startDate,
            this.props.endDate,
            this.getTimelineWidth(),
            this.props.snapMinutes
          );

          const snappedDw = getSnapPixelFromDelta(
            dw,
            this.props.startDate,
            this.props.endDate,
            this.getTimelineWidth(),
            this.props.snapMinutes
          );

          _.forEach(animatedItems, item => {
            item.style.width = intToPix(Number(item.getAttribute('initialWidth')) + snappedDw + minimumWidth);
            item.style.webkitTransform = item.style.transform = 'translate(' + snappedDx + 'px, 0px)';
          });
          e.target.setAttribute('delta-x', dx);
        })
        .on('resizeend', e => {
          let animatedItems = document.querySelectorAll("span[isResizing='True'") || [];
          // Update time
          const dx = parseFloat(e.target.getAttribute('delta-x')) || 0;
          const isStartTimeChange = dx != 0;

          let items = [];
          let minRowNo = Infinity;

          let durationChange = null;
          // Calculate the default item positions
          _.forEach(animatedItems, domItem => {
            let startPixelOffset = pixToInt(domItem.style.left) + dx;
            const {item, rowNo} = this.itemFromElement(domItem);

            minRowNo = Math.min(minRowNo, rowNo);

            if (isStartTimeChange) {
              let newStart = getTimeAtPixel(
                startPixelOffset,
                this.props.startDate,
                this.props.endDate,
                this.getTimelineWidth(),
                this.props.snapMinutes
              );
              if (durationChange === null) durationChange = item.start.diff(newStart, 'minutes');
              item.start = newStart;
            } else {
              let endPixelOffset = startPixelOffset + pixToInt(domItem.style.width);
              let newEnd = getTimeAtPixel(
                endPixelOffset,
                this.props.startDate,
                this.props.endDate,
                this.getTimelineWidth(),
                this.props.snapMinutes
              );
              if (durationChange === null) durationChange = item.end.diff(newEnd, 'minutes');

              item.end = newEnd;
            }

            // Check row height doesn't need changing
            let new_row_height = getMaxOverlappingItems(
              this.rowItemMap[rowNo],
              this.props.startDate,
              this.props.endDate
            );
            if (new_row_height !== this.rowHeightCache[rowNo]) {
              this.rowHeightCache[rowNo] = new_row_height;
            }

            //Reset styles
            domItem.removeAttribute('isResizing');
            domItem.removeAttribute('initialWidth');
            domItem.style['z-index'] = 2;
            domItem.style.webkitTransform = domItem.style.transform = 'translate(0px, 0px)';

            items.push(item);
          });
          if (durationChange === null) durationChange = 0;
          const changes = {isStartTimeChange, timeDelta: -durationChange};

          this.props.onInteraction(Timeline.changeTypes.resizeEnd, changes, items);

          e.target.setAttribute('delta-x', 0);
          this._grid.recomputeGridSize({rowIndex: minRowNo});
        });
    }

    if (canSelect) {
      this._selectRectangleInteractable
        .draggable({
          enabled: true,
          ignoreFrom: '.item_draggable, .rct9k-group'
        })
        .styleCursor(false)
        .on('dragstart', e => {
          this._selectBox.start(e.clientX, e.clientY);
        })
        .on('dragmove', e => {
          this._selectBox.move(e.dx, e.dy);
        })
        .on('dragend', e => {
          let {top, left, width, height} = this._selectBox.end();
          //Get the start and end row of the selection rectangle
          const topRow = Number(getNearestRowHeight(left, top));
          const bottomRow = Number(getNearestRowHeight(left + width, top + height));
          // console.log('top', topRow, 'bottom', bottomRow);
          //Get the start and end time of the selection rectangle
          left = left - this.props.groupOffset;
          let startOffset = width > 0 ? left : left + width;
          let endOffset = width > 0 ? left + width : left;
          const startTime = getTimeAtPixel(
            startOffset,
            this.props.startDate,
            this.props.endDate,
            this.getTimelineWidth(),
            this.props.snapMinutes
          );
          const endTime = getTimeAtPixel(
            endOffset,
            this.props.startDate,
            this.props.endDate,
            this.getTimelineWidth(),
            this.props.snapMinutes
          );
          // console.log('Start', startTime.format(), 'End', endTime.format());
          //Get items in these ranges
          let selectedItems = [];
          for (let r = Math.min(topRow, bottomRow); r <= Math.max(topRow, bottomRow); r++) {
            selectedItems.push(
              ..._.filter(this.rowItemMap[r], i => {
                return i.start.isBefore(endTime) && i.end.isAfter(startTime);
              })
            );
          }
          this.props.onInteraction(Timeline.changeTypes.itemsSelected, selectedItems);
        });
    }
  }

  _handleItemRowEvent = (e, itemCallback, rowCallback) => {
    e.preventDefault();
    // Skip click handler if selecting with selection box
    if (this.selecting) {
      return;
    }
    if (e.target.hasAttribute('data-item-index') || e.target.parentElement.hasAttribute('data-item-index')) {
      let itemKey = e.target.getAttribute('data-item-index') || e.target.parentElement.getAttribute('data-item-index');
      itemCallback && itemCallback(e, Number(itemKey));
    } else {
      let row = e.target.getAttribute('data-row-index');
      let clickedTime = getTimeAtPixel(
        e.clientX - this.props.groupOffset,
        this.props.startDate,
        this.props.endDate,
        this.getTimelineWidth()
      );

      //const roundedStartMinutes = Math.round(clickedTime.minute() / this.props.snapMinutes) * this.props.snapMinutes; // I dont know what this does
      let snappedClickedTime = timeSnap(clickedTime, this.props.snapMinutes * 60);
      rowCallback && rowCallback(e, row, clickedTime, snappedClickedTime);
    }
  };

  /**
   * @param {number} width container width (in px)
   */
  cellRenderer(width) {
    /**
     * @param  {} columnIndex Always 1
     * @param  {} key Unique key within array of cells
     * @param  {} parent Reference to the parent Grid (instance)
     * @param  {} rowIndex Vertical (row) index of cell
     * @param  {} style Style object to be applied to cell (to position it);
     */
    const {timelineMode, onItemHover, onItemLeave} = this.props;
    const canSelect = Timeline.isBitSet(Timeline.TIMELINE_MODES.SELECT, timelineMode);
    return ({columnIndex, key, parent, rowIndex, style}) => {
      let itemCol = 1;
      if (itemCol == columnIndex) {
        let itemsInRow = this.rowItemMap[rowIndex];
        return (
          <div
            key={key}
            style={style}
            data-row-index={rowIndex}
            className="rct9k-row"
            onClick={e => this._handleItemRowEvent(e, Timeline.no_op, this.props.onRowClick)}
            onMouseDown={e => (this.selecting = false)}
            onMouseMove={e => (this.selecting = true)}
            onMouseOver={e => {
              this.selecting = false;
              return this._handleItemRowEvent(e, onItemHover, null);
            }}
            onMouseLeave={e => {
              this.selecting = false;
              return this._handleItemRowEvent(e, onItemLeave, null);
            }}
            onContextMenu={e =>
              this._handleItemRowEvent(e, this.props.onItemContextClick, this.props.onRowContextClick)
            }
            onDoubleClick={e => this._handleItemRowEvent(e, this.props.onItemDoubleClick, this.props.onRowDoubleClick)}>
            {rowItemsRenderer(
              itemsInRow,
              this.props.startDate,
              this.props.endDate,
              width,
              this.props.itemHeight,
              this.props.itemRenderer,
              canSelect ? this.props.selectedItems : []
            )}
          </div>
        );
      } else {
        const GroupComp = this.props.groupRenderer;
        let group = _.find(this.props.groups, g => g.id == rowIndex);
        return (
          <div data-row-index={rowIndex} key={key} style={style} className="rct9k-group">
            <GroupComp group={group} />
          </div>
        );
      }
    };
  }

  getCursor() {
    const {showCursorTime, cursorTimeFormat} = this.props;
    const {cursorTime} = this.state;
    return showCursorTime && cursorTime ? cursorTime.clone().format(cursorTimeFormat) : null;
  }

  cellRangeRenderer(props) {
    const {showCursorTime} = this.props;
    const children = defaultCellRangeRenderer(props);
    const height = props.parent.props.height;
    const top = props.scrollTop;
    let markers = [];
    if (showCursorTime && this.mouse_snapped_time) {
      const cursorPix = getPixelAtTime(
        this.mouse_snapped_time,
        this.props.startDate,
        this.props.endDate,
        this.getTimelineWidth()
      );
      markers.push({
        location: cursorPix + this.props.groupOffset,
        key: 1
      });
    }
    _.forEach(markers, m => {
      children.push(<div key={m.key} className="rct9k-marker-overlay" style={{height, left: m.location, top}} />);
    });
    return children;
  }

  /**
   * Helper for react virtuaized to get the row height given a row index
   */
  rowHeight({index}) {
    let rh = this.rowHeightCache[index] ? this.rowHeightCache[index] : 1;
    return rh * this.props.itemHeight;
  }

  /**
   * Set the grid ref.
   * @param {Object} domElement Grid react element
   */
  grid_ref_callback(domElement) {
    this._grid = domElement;
  }

  /**
   * Set the select box ref.
   * @param {Object} domElement Selectbox react element
   */
  select_ref_callback(domElement) {
    this._selectBox = domElement;
  }

  /**
   * Event handler for onMouseMove.
   * Only calls back if a new snap time is reached
   */
  mouseMoveFunc(e) {
    const cursorSnappedTime = getTimeAtPixel(
      e.clientX - this.props.groupOffset,
      this.props.startDate,
      this.props.endDate,
      this.getTimelineWidth(),
      this.props.snapMinutes
    );
    if (!this.mouse_snapped_time || this.mouse_snapped_time.unix() !== cursorSnappedTime.unix()) {
      if (cursorSnappedTime.isSameOrAfter(this.props.startDate)) {
        this.mouse_snapped_time = cursorSnappedTime;
        this.setState({cursorTime: this.mouse_snapped_time});
        this.props.onInteraction(
          Timeline.changeTypes.snappedMouseMove,
          {snappedTime: this.mouse_snapped_time.clone()},
          null
        ); // TODO: Document
        this._grid.forceUpdate();
      }
    }
  }

  render() {
    const {onInteraction, groupOffset, timebarFormat} = this.props;

    let varTimebarProps = {};
    if (timebarFormat) varTimebarProps['timeFormats'] = timebarFormat;

    function columnWidth(width) {
      return ({index}) => {
        if (index === 0) return groupOffset;
        return width - groupOffset;
      };
    }

    return (
      <div className="rct9k-timeline-div">
        <AutoSizer onResize={this.refreshGrid}>
          {({height, width}) => (
            <div className="parent-div" onMouseMove={this.mouseMoveFunc}>
              <SelectBox ref={this.select_ref_callback} />
              <Timebar
                cursorTime={this.getCursor()}
                start={this.props.startDate}
                end={this.props.endDate}
                width={width}
                leftOffset={groupOffset}
                selectedRanges={this.state.selection}
                {...varTimebarProps}
              />
              <Grid
                ref={this.grid_ref_callback}
                autoContainerWidth
                cellRenderer={this.cellRenderer(this.getTimelineWidth(width))}
                cellRangeRenderer={this.cellRangeRenderer}
                columnCount={2}
                columnWidth={columnWidth(width)}
                height={height}
                rowCount={this.props.groups.length}
                rowHeight={this.rowHeight}
                width={width}
              />
            </div>
          )}
        </AutoSizer>
      </div>
    );
  }
}
