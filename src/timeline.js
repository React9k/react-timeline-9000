'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Grid, AutoSizer, defaultCellRangeRenderer} from 'react-virtualized';

import moment from 'moment';
import interact from 'interactjs';
import _ from 'lodash';

import {pixToInt, intToPix} from 'utils/commonUtils';
import {rowItemsRenderer, getNearestRowHeight, getMaxOverlappingItems} from 'utils/itemUtils';
import {getTimeAtPixel, getPixelAtTime} from 'utils/timeUtils';
import {groupRenderer} from 'utils/groupUtils';
import Timebar from 'components/timebar';

import './style.css';

export default class Timeline extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    groups: PropTypes.arrayOf(PropTypes.object).isRequired,
    groupOffset: PropTypes.number.isRequired,
    selectedItems: PropTypes.arrayOf(PropTypes.number),
    startDate: PropTypes.object.isRequired,
    endDate: PropTypes.object.isRequired,
    snapMinutes: PropTypes.number,
    itemHeight: PropTypes.number,
    onItemClick: PropTypes.func,
    onInteraction: PropTypes.func,
    onRowClick: PropTypes.func
  };

  static defaultProps = {
    groupOffset: 150,
    itemHeight: 40,
    snapMinutes: 15
  };

  static changeTypes = {
    resizeStart: 'resizeStart',
    resizeEnd: 'resizeEnd',
    dragEnd: 'dragEnd',
    dragStart: 'dragStart'
  };

  constructor(props) {
    super(props);
    this.state = {selection: []};
    this.setTimeMap(this.props.items);

    this.cellRenderer = this.cellRenderer.bind(this);
    this.cellRangeRenderer = this.cellRangeRenderer.bind(this);
    this.rowHeight = this.rowHeight.bind(this);
    this.setTimeMap = this.setTimeMap.bind(this);
    this.changeGroup = this.changeGroup.bind(this);
    this.setSelection = this.setSelection.bind(this);
    this.clearSelection = this.clearSelection.bind(this);
    this.getTimelineWidth = this.getTimelineWidth.bind(this);
    this._itemRowClickHandler = this._itemRowClickHandler.bind(this);
    this.itemFromEvent = this.itemFromEvent.bind(this);

    this.setUpDragging();
  }

  componentWillReceiveProps(nextProps) {
    this.setTimeMap(nextProps.items);
  }

  setTimeMap(items) {
    this.itemRowMap = {}; // timeline elements (key) => (rowNo).
    this.rowItemMap = {}; // (rowNo) => timeline elements
    this.rowHeightCache = {}; // (rowNo) => max number of stacked items
    let visibleItems = _.filter(items, i => {
      return i.end > this.props.startDate && i.start < this.props.endDate;
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

  itemFromEvent(e) {
    const index = e.target.getAttribute('item-index');
    const rowNo = this.itemRowMap[index];
    const itemIndex = _.findIndex(this.rowItemMap[rowNo], i => i.key == index);
    const item = this.rowItemMap[rowNo][itemIndex];

    return {index, rowNo, itemIndex, item};
  }

  changeGroup(item, curRow, newRow) {
    item.row = newRow;
    this.itemRowMap[item.key] = newRow;
    this.rowItemMap[curRow] = this.rowItemMap[curRow].filter(i => i.key !== item.key);
    this.rowItemMap[newRow].push(item);
  }
  setSelection(start, end) {
    this.setState({selection: [{start: start.clone(), end: end.clone()}]});
  }
  clearSelection() {
    this.setState({selection: []});
  }
  getTimelineWidth(totalWidth) {
    const {groupOffset} = this.props;
    if (totalWidth !== undefined) return totalWidth - groupOffset;
    return this._grid.props.width - groupOffset;
  }

  setUpDragging() {
    interact('.item_draggable')
      .draggable({
        enabled: true
      })
      .on('dragstart', e => {
        const {item} = this.itemFromEvent(e);
        this.setSelection(item.start, item.end);
        const animatedItems = this.props.onInteraction(Timeline.changeTypes.dragStart, null, this.props.selectedItems);

        animatedItems.forEach(a => {
          const tgt = document.querySelector(`[item-index='${a}']`);
          tgt.style['z-index'] = 3;
        });

        e.target.setAttribute('animatedItems', JSON.stringify(animatedItems));
      })
      .on('dragmove', e => {
        const target = e.target;
        let animatedItems = JSON.parse(target.getAttribute('animatedItems') || []);

        let dx = (parseFloat(target.getAttribute('drag-x')) || 0) + e.dx;
        let dy = (parseFloat(target.getAttribute('drag-y')) || 0) + e.dy;

        animatedItems.forEach(a => {
          const selectedTarget = document.querySelector(`[item-index='${a}']`);
          // if( selectedTarget.length)
          selectedTarget.style.webkitTransform = selectedTarget.style.transform =
            'translate(' + dx + 'px, ' + dy + 'px)';
        });
        // translate the element
        // target.style.webkitTransform = target.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
        target.setAttribute('drag-x', dx);
        target.setAttribute('drag-y', dy);

        const {item} = this.itemFromEvent(e);

        let itemDuration = item.end.diff(item.start);
        let newPixelOffset = pixToInt(e.target.style.left) + dx;
        let newStart = getTimeAtPixel(
          newPixelOffset,
          this.props.startDate,
          this.props.endDate,
          this.getTimelineWidth(),
          this.props.snapMinutes
        );
        let newEnd = newStart.clone().add(itemDuration);
        this.setSelection(newStart, newEnd);
      })
      .on('dragend', e => {
        //TODO: Should be able to optimize the lookup below
        const {item, rowNo} = this.itemFromEvent(e);

        this.setSelection(item.start, item.end);
        this.clearSelection();
        // Change row
        console.log('From row', rowNo);
        let newRow = getNearestRowHeight(e.clientX, e.clientY);
        console.log('To row', newRow);
        // this.changeGroup(item, rowNo, newRow);

        let rowChangeDelta = newRow - rowNo;
        // Update time
        // let itemDuration = item.end.diff(item.start);
        let newPixelOffset = pixToInt(e.target.style.left) + (parseFloat(e.target.getAttribute('drag-x')) || 0);
        let newStart = getTimeAtPixel(
          newPixelOffset,
          this.props.startDate,
          this.props.endDate,
          this.getTimelineWidth(),
          this.props.snapMinutes
        );

        const timeDelta = newStart.clone().diff(item.start, 'minutes');
        const changes = {rowChangeDelta, timeDelta, targetItemKey: item.key};
        this.props.onInteraction(Timeline.changeTypes.dragEnd, changes, this.props.selectedItems);

        // Reset the styles
        let animatedItems = JSON.parse(e.target.getAttribute('animatedItems') || []);
        animatedItems.forEach(a => {
          const selectedTarget = document.querySelector(`[item-index='${a}']`);
          selectedTarget.style.webkitTransform = selectedTarget.style.transform = 'translate(0px, 0px)';
          selectedTarget.setAttribute('drag-x', 0);
          selectedTarget.setAttribute('drag-y', 0);
          selectedTarget.style.webkitTransform = selectedTarget.style.transform = 'translate(0px, 0px)';
          selectedTarget.style['z-index'] = 2;
          selectedTarget.style['top'] = intToPix(
            this.props.itemHeight * Math.round(pixToInt(selectedTarget.style['top']) / this.props.itemHeight)
          );
        });

        this._grid.recomputeGridSize({rowIndex: 0});
      })
      .resizable({
        edges: {left: true, right: true, bottom: false, top: false}
      })
      .on('resizestart', e => {
        console.log('resizestart', e.dx, e.target.style.left, e.target.style.width);
        const selected = this.props.onInteraction(Timeline.changeTypes.resizeStart, null, this.props.selectedItems);
        e.target.setAttribute('animatedItems', JSON.stringify(selected));
      })
      .on('resizemove', e => {
        console.log('resizemove', e.dx, e.target.style.width, e.target.style.left);

        let animatedItems = JSON.parse(e.target.getAttribute('animatedItems') || []);

        // Determine if the resize is from the right or left
        // let dx = parseFloat(e.target.getAttribute('delta-x')) || 0;
        // dx += e.deltaRect.left;

        animatedItems.forEach(a => {
          const tgt = document.querySelector(`[item-index='${a}']`);
          let dx = parseFloat(e.target.getAttribute('delta-x')) || 0;
          // let dx = e.dx;

          const interactable = interact(document.querySelector(`[item-index='${a}']`));

          const rect = interactable.getRect();
          dx += rect.left;

          console.log(rect.left, dx, rect.width);
          // const tgtdx = dx + tgt.deltaRect.left;
          // tgt.style.width = rect.width + 'px';
          //tgt.style.webkitTransform = tgt.style.transform = 'translate(' + dx + 'px, 0px)';
          //tgt.setAttribute('delta-x', dx);
          e.target.setAttribute('delta-x', dx);
        });

        // e.target.style.width = e.rect.width + 'px';
        // e.target.style.webkitTransform = e.target.style.transform = 'translate(' + dx + 'px, 0px)';
        // e.target.setAttribute('delta-x', dx);
      })
      .on('resizeend', e => {
        console.log('resizeend', e);
        // Update time
        const dx = e.target.getAttribute('delta-x');
        const isStartTimeChange = dx != 0;
        const {item, rowNo} = this.itemFromEvent(e);
        let startPixelOffset = pixToInt(e.target.style.left) + (parseFloat(e.target.getAttribute('delta-x')) || 0);
        let endPixelOffset = startPixelOffset + pixToInt(e.target.style.width);

        let newTime = getTimeAtPixel(
          isStartTimeChange ? startPixelOffset : endPixelOffset,
          this.props.startDate,
          this.props.endDate,
          this.getTimelineWidth(),
          this.props.snapMinutes
        );

        const timeDelta = isStartTimeChange
          ? newTime.clone().diff(item.start, 'minutes')
          : newTime.clone().diff(item.end, 'minutes');
        const changes = {isStartTimeChange, timeDelta, targetItemKey: item.key};
        this.props.onInteraction(Timeline.changeTypes.resizeEnd, changes, this.props.selectedItems);

        this._grid.recomputeGridSize({rowIndex: 0});

        let animatedItems = JSON.parse(e.target.getAttribute('animatedItems') || []);

        animatedItems.forEach(a => {
          const tgt = document.querySelector(`[item-index='${a}']`);
          tgt.setAttribute('delta-x', 0);
          tgt.style.webkitTransform = tgt.style.transform = 'translate(0px, 0px)';
        });
      });
  }

  _itemRowClickHandler(e) {
    if (e.target.hasAttribute('item-index') || e.target.parentElement.hasAttribute('item-index')) {
      // console.log('Clicking item');
      let itemKey = e.target.getAttribute('item-index') || e.target.parentElement.getAttribute('item-index');
      this.props.onItemClick && this.props.onItemClick(e, Number(itemKey));
    } else {
      let row = e.target.getAttribute('row-index');
      let clickedTime = getTimeAtPixel(e.clientX, this.props.startDate, this.props.endDate, this.getTimelineWidth());
      // console.log('Clicking row ' + row + ' at ' + clickedTime.format());
      this.props.onRowClick && this.props.onRowClick(e, row, clickedTime);
    }
  }
  /**
   * @param  {} width container width (in px)
   */
  cellRenderer(width) {
    /**
     * @param  {} columnIndex Always 1
     * @param  {} key Unique key within array of cells
     * @param  {} parent Reference to the parent Grid (instance)
     * @param  {} rowIndex Vertical (row) index of cell
     * @param  {} style Style object to be applied to cell (to position it);
     */
    return ({columnIndex, key, parent, rowIndex, style}) => {
      let itemCol = 1;
      if (itemCol == columnIndex) {
        let itemsInRow = this.rowItemMap[rowIndex];
        return (
          <div key={key} style={style} row-index={rowIndex} className="rct9k-row" onClick={this._itemRowClickHandler}>
            {rowItemsRenderer(
              itemsInRow,
              this.props.startDate,
              this.props.endDate,
              width,
              this.props.itemHeight,
              this.props.selectedItems,
              this.props.onItemClick
            )}
          </div>
        );
      } else {
        let group = _.find(this.props.groups, g => g.id == rowIndex);
        return (
          <div key={key} style={style} className="rct9k-group">
            {groupRenderer(group)}
          </div>
        );
      }
    };
  }

  cellRangeRenderer(props) {
    const children = defaultCellRangeRenderer(props);
    const height = props.parent.props.height;
    const top = props.scrollTop;
    let markers = [];
    // today
    markers.push({
      location:
        getPixelAtTime(
          moment('2000-01-01 10:00:00'),
          this.props.startDate,
          this.props.endDate,
          this.getTimelineWidth(props.parent.props.width)
        ) + this.props.groupOffset,
      key: 1
    });
    _.forEach(markers, m => {
      children.push(<div key={m.key} className="rct9k-marker-overlay" style={{height, left: m.location, top}} />);
    });
    return children;
  }
  rowHeight({index}) {
    return this.rowHeightCache[index] * this.props.itemHeight;
  }

  render() {
    const {groupOffset} = this.props;

    function columnWidth(width) {
      return ({index}) => {
        if (index === 0) return groupOffset;
        return width - groupOffset;
      };
    }
    return (
      <div className="rct9k-timeline-div">
        <AutoSizer>
          {({height, width}) => (
            <div>
              <Timebar
                start={this.props.startDate}
                end={this.props.endDate}
                width={width}
                leftOffset={groupOffset}
                selectedRanges={this.state.selection}
              />
              <Grid
                ref={ref => (this._grid = ref)}
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
