'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Grid, AutoSizer} from 'react-virtualized';

import moment from 'moment';
import interact from 'interactjs';
import _ from 'lodash';

import {sumStyle, pixToInt} from 'utils/common';
import {rowItemsRenderer, getTimeAtPixel, getNearestRowHeight} from 'utils/itemUtils';

import './style.css';

const ITEM_HEIGHT = 40;

const VISIBLE_START = moment('2000-01-01');
const VISIBLE_END = VISIBLE_START.clone().add(1, 'days');

export default class Timeline extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    groups: PropTypes.arrayOf(PropTypes.number).isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
    this.setTimeMap(this.props.items);

    this.rowRenderer = this.rowRenderer.bind(this);
    this.setTimeMap = this.setTimeMap.bind(this);
    this.changeGroup = this.changeGroup.bind(this);
    this._itemRowClickHandler = this._itemRowClickHandler.bind(this);
    this.setUpDragging();
  }

  componentWillReceiveProps(nextProps) {
    this.setTimeMap(nextProps.items);
  }

  setTimeMap(items) {
    this.itemRowMap = {}; // timeline elements (key) => (rowNo).
    this.rowItemMap = {}; // (rowNo) => timeline elements
    items.forEach(i => {
      this.itemRowMap[i.key] = i.row;
      if (this.rowItemMap[i.row] === undefined) this.rowItemMap[i.row] = [];
      this.rowItemMap[i.row].push(i);
    });
  }
  changeGroup(item, curRow, newRow) {
    item.row = newRow;
    this.itemRowMap[item.key] = newRow;
    this.rowItemMap[curRow] = this.rowItemMap[curRow].filter(i => i.key !== item.key);
    this.rowItemMap[newRow].push(item);
  }
  setUpDragging() {
    interact('.item_draggable').draggable({
      onstart: e => {
        e.target.style['z-index'] = 2;
      },
      onmove: e => {
        e.target.style.left = sumStyle(e.target.style.left, e.dx);
        let curTop = e.target.style.top ? e.target.style.top : '0px';
        e.target.style.top = sumStyle(curTop, e.dy);
      },
      onend: e => {
        const index = e.target.getAttribute('item-index');
        const rowNo = this.itemRowMap[index];
        const itemIndex = _.findIndex(this.rowItemMap[rowNo], i => i.key == index);
        const item = this.rowItemMap[rowNo][itemIndex];
        // Change row (TODO)
        let offset = e.target.style.top;
        console.log('From ' + rowNo);
        let newRow = getNearestRowHeight(rowNo, ITEM_HEIGHT, pixToInt(offset));
        console.log('From ' + newRow);
        this.changeGroup(item, rowNo, newRow);
        // Update time
        let itemDuration = item.end.diff(item.start);
        let newStart = getTimeAtPixel(
          pixToInt(e.target.style.left),
          VISIBLE_START,
          VISIBLE_END,
          this._grid.props.width
        );
        let newEnd = newStart.clone().add(itemDuration);
        item.start = newStart;
        item.end = newEnd;
        //reset styles
        e.target.style['z-index'] = 1;
        e.target.style['top'] = '0px';
        this._grid.forceUpdate();
      }
    });
  }
  _itemRowClickHandler(e) {
    if (e.target.hasAttribute('item-index') || e.target.parentElement.hasAttribute('item-index')) {
      console.log('Clicking item');
    } else {
      let row = e.target.getAttribute('row-index');
      let clickedTime = getTimeAtPixel(e.clientX, VISIBLE_START, VISIBLE_END, this._grid.props.width);
      console.log('Clicking row ' + row + ' at ' + clickedTime.format());
    }
  }
  /**
   * @param  {} width container width (in px)
   */
  rowRenderer(width) {
    /**
     * @param  {} columnIndex Always 1
     * @param  {} key Unique key within array of cells
     * @param  {} parent Reference to the parent Grid (instance)
     * @param  {} rowIndex Vertical (row) index of cell
     * @param  {} style Style object to be applied to cell (to position it);
     */
    return ({columnIndex, key, parent, rowIndex, style}) => {
      let itemsInRow = this.rowItemMap[rowIndex];
      return (
        <div key={key} row-index={rowIndex} style={style} className="rct9k-row" onClick={this._itemRowClickHandler}>
          {rowItemsRenderer(itemsInRow, VISIBLE_START, VISIBLE_END, width)}
        </div>
      );
    };
  }

  render() {
    return (
      <div className="rct9k-timeline-div">
        <AutoSizer>
          {({height, width}) => (
            <Grid
              ref={ref => (this._grid = ref)}
              autoContainerWidth
              cellRenderer={this.rowRenderer(width)}
              columnCount={1}
              columnWidth={width}
              height={height}
              rowCount={this.props.groups.length}
              rowHeight={ITEM_HEIGHT}
              width={width}
            />
          )}
        </AutoSizer>
      </div>
    );
  }
}
