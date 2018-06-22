'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
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

    this.cellRenderer = this.cellRenderer.bind(this);
    this.cellSizeAndPositionGetter = this.cellSizeAndPositionGetter.bind(this);
    this.list = [];
    for (let i = 0; i < 1000; i++) {
      for (let j = 0; j < 1000; j++) {
        this.list.push({
          name: `Roster item ${i}-${j}`,
          x: 13 + ITEM_WIDTH * j,
          y: 34 + ITEM_HEIGHT * i,
          width: ITEM_WIDTH,
          height: ITEM_HEIGHT
        });
      }
    }
  }

  cellRenderer({index, key, style}) {
    let color = index % 3 == 1 ? 'blue' : 'green';
    return (
      <div key={key} style={style}>
        <div style={{padding: '3px', margin: '3px', backgroundColor: color}}>{this.list[index].name}</div>
      </div>
    );
  }

  cellSizeAndPositionGetter({index}) {
    const datum = this.list[index];

    return {
      height: datum.height,
      width: datum.width,
      x: datum.x,
      y: datum.y
    };
  }

  render() {
    return (
      <div className="rct-timeline-div">
        <AutoSizer>
          {({height, width}) => (
            <Collection
              cellCount={this.list.length}
              cellRenderer={this.cellRenderer}
              cellSizeAndPositionGetter={this.cellSizeAndPositionGetter}
              height={height}
              width={width}
            />
          )}
        </AutoSizer>
      </div>
    );
  }
}
