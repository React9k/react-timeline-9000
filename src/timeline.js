'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {CellMeasurer, CellMeasurerCache, Grid, AutoSizer} from 'react-virtualized';

import moment from 'moment';
import interact from 'interactjs';
import _ from 'lodash';

import {getItemMarginClass} from 'utils/itemUtils';

import './style.css';

const ITEM_HEIGHT = 40;
const ITEM_WIDTH = 150;

const RESOLUTION = moment.duration(15, 'minutes');
const VISIBLE_START = moment('2000-01-01');

export default class Timeline extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
    this.setTimeMap(this.props.items);

    this.cellRenderer = this.cellRenderer.bind(this);
    this.cellSizeAndPositionGetter = this.cellSizeAndPositionGetter.bind(this);
    this.setTimeMap = this.setTimeMap.bind(this);
    // this.setUpDragging();
  }

  componentWillReceiveProps(nextProps) {
    this.setTimeMap(nextProps.items);
  }

  setTimeMap(items) {
    this.itemGridMap = {}; // timeline elements (key) => grid coordinates (row, col).
    this.gridItemMap = []; // grid coordinates (row, col) => timeline elements (key)
    items.forEach(i => {
      const row = i.row;
      const col_start = Math.floor(i.start.diff(VISIBLE_START, 'minutes') / 15);
      const col_end = Math.floor(i.end.diff(VISIBLE_START, 'minutes') / 15);
      for (let col = col_start; col < col_end; col++) {
        if (this.itemGridMap[i.key] === undefined) this.itemGridMap[i.key] = [];
        this.itemGridMap[i.key].push([row, col]);
        if (this.gridItemMap[row] === undefined) this.gridItemMap[row] = [];
        if (this.gridItemMap[row][col] === undefined) this.gridItemMap[row][col] = [];
        this.gridItemMap[row][col].push(i);
      }
    });
  }
  // setUpDragging() {
  //   interact('.item_draggable').draggable({
  //     onmove: e => {
  //       const index = parseInt(e.target.getAttribute('item-index'));
  //       this.list[index].x = this.list[index].x + e.dx;
  //       this.list[index].y = this.list[index].y + e.dy;
  //       this._collection.recomputeCellSizesAndPositions();
  //     }
  //     // ,onend: e => {}
  //   });
  // }

  cellRenderer({columnIndex, key, parent, rowIndex, style}) {
    const items = this.gridItemMap[rowIndex] === undefined ? undefined : this.gridItemMap[rowIndex][columnIndex];
    if (items)
      if (items[0]) {
        //only support 1 item per row atm
        let itemInCols = _.map(this.itemGridMap[items[0].key], a => a[1]); // all the column indexes the item is in
        const className = getItemMarginClass(itemInCols, columnIndex);
        return (
          <div key={key} style={style} className="rct9k-items-outer item_draggable">
            <div className={className} style={{backgroundColor: items[0].color}}>
              {items[0].title}
            </div>
          </div>
        );
      }
    return <div style={style} key={key} />;
  }

  cellSizeAndPositionGetter({index}) {
    const {height, width, x, y} = this.list[index];

    return {
      height,
      width,
      x,
      y
    };
  }

  render() {
    return (
      <div className="rct9k-timeline-div">
        <AutoSizer>
          {({height, width}) => (
            <Grid
              cellRenderer={this.cellRenderer}
              columnCount={1000}
              columnWidth={ITEM_WIDTH}
              height={height}
              rowCount={100}
              rowHeight={ITEM_HEIGHT}
              width={width}
            />
          )}
        </AutoSizer>
      </div>
    );
  }
}
