'use strict';

import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {Collection, AutoSizer} from 'react-virtualized';

import './style.css';

const ITEM_COUNT = 2000;
const ITEM_PADDING = 10;
const ITEM_HEIGHT = 40;
const ITEM_WIDTH = 150;

export default class Timeline extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};

    this.items = Array(ITEM_COUNT)
      .fill()
      .map((val, id) => {
        return {
          id: id
          // title: `item ${id}`,
          // length: Math.floor(Math.random()*10)    //between 1 and 10
        };
      });
  }

  _cellRenderer({index, key, style}) {
    return (
      <div key={key} style={{backgroundColor: 'blue'}}>
        {index}
      </div>
    );
  }

  _cellSizeAndPositionGetter({index}) {
    const columnCount = 4;

    const columnNumber = (index % columnCount) + 1;

    const rowNumber = Math.floor(index / (columnCount * columnNumber)) + 1;

    const x = columnNumber * (ITEM_WIDTH + ITEM_PADDING);
    const y = rowNumber * (ITEM_HEIGHT + ITEM_PADDING);
    console.log('C: ' + columnNumber + 'R: ' + rowNumber);
    console.log('X: ' + x + ' Y: ' + y);
    return {
      height: ITEM_HEIGHT,
      width: ITEM_WIDTH,
      x,
      y
    };
  }

  render() {
    const items = this.items;
    return (
      <div className="rct-timeline-div">
        <AutoSizer>
          {({height, width}) => (
            <Collection
              cellCount={items.length}
              cellRenderer={this._cellRenderer}
              cellSizeAndPositionGetter={this._cellSizeAndPositionGetter}
              height={height}
              width={width}
            />
          )}
        </AutoSizer>
      </div>
    );
  }
}
