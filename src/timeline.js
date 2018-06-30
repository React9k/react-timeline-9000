'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Grid, AutoSizer, defaultCellRangeRenderer} from 'react-virtualized';

import moment from 'moment';
import interact from 'interactjs';
import _ from 'lodash';

import {sumStyle, pixToInt, intToPix} from 'utils/common';
import {
  rowItemsRenderer,
  getTimeAtPixel,
  getPixelAtTime,
  getNearestRowHeight,
  getMaxOverlappingItems,
  getDurationFromPixels
} from 'utils/itemUtils';
import {groupRenderer} from 'utils/groupUtils';
import Timebar from 'components/timebar';

import './style.css';
const ITEM_HEIGHT = 40;
const GROUP_WIDTH = 100;

const VISIBLE_START = moment('2000-01-01');
const VISIBLE_END = VISIBLE_START.clone().add(1, 'days');

export default class Timeline extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    groups: PropTypes.arrayOf(PropTypes.object).isRequired,
    renderGroups: PropTypes.bool
  };
  static defaultProps = {
    renderGroups: true
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
      return i.end > VISIBLE_START && i.start < VISIBLE_END;
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
    if (totalWidth !== undefined) return totalWidth - 100;
    return this._grid.props.width - 100; //HACK: This is the sidebar width
  }
  setUpDragging() {
    interact('.item_draggable')
      .draggable({
        enabled: true
      })
      .on('dragstart', e => {
        e.target.style['z-index'] = 3;
        const {item} = this.itemFromEvent(e);
        this.setSelection(item.start, item.end);
      })
      .on('dragmove', e => {
        const target = e.target;
        let dx = (parseFloat(target.getAttribute('drag-x')) || 0) + e.dx;
        let dy = (parseFloat(target.getAttribute('drag-y')) || 0) + e.dy;

        // translate the element
        target.style.webkitTransform = target.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
        target.setAttribute('drag-x', dx);
        target.setAttribute('drag-y', dy);
        e.target.style.left = sumStyle(e.target.style.left, e.dx);
        let curTop = e.target.style.top ? e.target.style.top : '0px';
        e.target.style.top = sumStyle(curTop, e.dy);
        const {item} = this.itemFromEvent(e);

        let itemDuration = item.end.diff(item.start);
        let newPixelOffset = pixToInt(e.target.style.left) + dx;
        let newStart = getTimeAtPixel(newPixelOffset, VISIBLE_START, VISIBLE_END, this.getTimelineWidth());
        let newEnd = newStart.clone().add(itemDuration);
        this.setSelection(newStart, newEnd);
      })
      .on('dragend', e => {
        //TODO: This should use state reducer
        //TODO: Should be able to optimize the lookup below
        const {item, rowNo} = this.itemFromEvent(e);
        this.setSelection(item.start, item.end);
        if (item === undefined);
        this.clearSelection();
        // Change row
        console.log('From row', rowNo);
        let newRow = getNearestRowHeight(e.clientX, e.clientY);
        console.log('To row', newRow);
        this.changeGroup(item, rowNo, newRow);
        // Update time
        let itemDuration = item.end.diff(item.start);
        let newPixelOffset = pixToInt(e.target.style.left) + (parseFloat(e.target.getAttribute('drag-x')) || 0);
        let newStart = getTimeAtPixel(newPixelOffset, VISIBLE_START, VISIBLE_END, this.getTimelineWidth());
        let newEnd = newStart.clone().add(itemDuration);
        item.start = newStart;
        item.end = newEnd;
        //reset styles
        e.target.setAttribute('drag-x', 0);
        e.target.setAttribute('drag-y', 0);
        e.target.style.webkitTransform = e.target.style.transform = 'translate(0px, 0px)';
        e.target.style['z-index'] = 2;
        e.target.style['top'] = intToPix(ITEM_HEIGHT * Math.round(pixToInt(e.target.style['top']) / ITEM_HEIGHT));
        // e.target.style['top'] = '0px';
        // Check row height doesn't need changing
        let need_recompute = false;
        let new_to_row_height = getMaxOverlappingItems(this.rowItemMap[newRow], VISIBLE_START, VISIBLE_END);
        if (new_to_row_height !== this.rowHeightCache[newRow]) {
          this.rowHeightCache[newRow] = new_to_row_height;
          need_recompute = true;
        }
        let new_from_row_height = getMaxOverlappingItems(this.rowItemMap[rowNo], VISIBLE_START, VISIBLE_END);
        if (new_from_row_height !== this.rowHeightCache[rowNo]) {
          this.rowHeightCache[rowNo] = new_from_row_height;
          need_recompute = true;
        }
        if (need_recompute) this._grid.recomputeGridSize({rowIndex: Math.min(newRow, rowNo)});
        else this._grid.forceUpdate();
      })
      .resizable({
        edges: {left: true, right: true, bottom: false, top: false}
      })
      .on('resizestart', e => {
        console.log('resizestart', e.dx, e.target.style.left, e.target.style.width);
      })
      .on('resizemove', e => {
        console.log('resizemove', e.dx, e.target.style.width, e.target.style.left);
        // Determine if the resize is from the right or left
        const isStartTimeChange = e.deltaRect.left !== 0;
        const {item} = this.itemFromEvent(e);

        // Add the duration to the start or end time depending on where the resize occurred
        if (isStartTimeChange) {
          item.start = getTimeAtPixel(
            pixToInt(e.target.style.left) + e.dx,
            VISIBLE_START,
            VISIBLE_END,
            this._grid.props.width
          );
        } else {
          item.end = getTimeAtPixel(
            pixToInt(e.target.style.left) + pixToInt(e.target.style.width) + e.dx,
            VISIBLE_START,
            VISIBLE_END,
            this._grid.props.width
          );
        }

        this._grid.forceUpdate();
      })
      .on('resizeend', e => {
        console.log('resizeend', e);
      });
  }

  _itemRowClickHandler(e) {
    if (e.target.hasAttribute('item-index') || e.target.parentElement.hasAttribute('item-index')) {
      // console.log('Clicking item');
    } else {
      let row = e.target.getAttribute('row-index');
      let clickedTime = getTimeAtPixel(e.clientX, VISIBLE_START, VISIBLE_END, this.getTimelineWidth());
      // console.log('Clicking row ' + row + ' at ' + clickedTime.format());
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
      let itemCol = this.props.renderGroups ? 1 : 0;
      if (itemCol == columnIndex) {
        let itemsInRow = this.rowItemMap[rowIndex];
        return (
          <div key={key} style={style} row-index={rowIndex} className="rct9k-row" onClick={this._itemRowClickHandler}>
            {rowItemsRenderer(itemsInRow, VISIBLE_START, VISIBLE_END, width, ITEM_HEIGHT)}
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
      location: getPixelAtTime(
        moment('2000-01-01 10:00:00'),
        VISIBLE_START,
        VISIBLE_END,
        this.getTimelineWidth(props.parent.props.width)
      ),
      key: 1
    });
    _.forEach(markers, m => {
      children.push(<div key={m.key} className="rct9k-marker-overlay" style={{height, left: m.location, top}} />);
    });
    return children;
  }
  rowHeight({index}) {
    return this.rowHeightCache[index] * ITEM_HEIGHT;
  }

  render() {
    const {renderGroups} = this.props;
    const columnCount = renderGroups ? 2 : 1;

    function columnWidth(width) {
      return ({index}) => {
        if (columnCount == 1) return width;
        if (columnCount == 2) {
          let groupWidth = GROUP_WIDTH;

          if (index == 0) return groupWidth;
          return width - groupWidth;
        }
      };
    }

    return (
      <div className="rct9k-timeline-div">
        <AutoSizer>
          {({height, width}) => (
            <div>
              <Timebar
                start={VISIBLE_START}
                end={VISIBLE_END}
                width={width}
                leftOffset={GROUP_WIDTH}
                selectedRanges={this.state.selection}
              />
              <Grid
                ref={ref => (this._grid = ref)}
                autoContainerWidth
                cellRenderer={this.cellRenderer(this.getTimelineWidth(width))}
                cellRangeRenderer={this.cellRangeRenderer}
                columnCount={columnCount}
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
