'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Collection, AutoSizer} from 'react-virtualized';

import './style.css';

const ITEM_COUNT = [1000, 1000];
const ITEM_HEIGHT = 40;
const ITEM_WIDTH = 150;

const DISTRIBUTION = 80 / 100;

export default class Timeline extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object)
  };
  static defaultProps = {
    items: []
  };

  constructor(props) {
    super(props);
    this.state = {};

    const colors = ['lightblue', 'red', 'green', 'yellow', 'orange', 'pink'];

    this.cellRenderer = this.cellRenderer.bind(this);
    this.cellSizeAndPositionGetter = this.cellSizeAndPositionGetter.bind(this);
    this.list = [];
    for (let i = 0; i < ITEM_COUNT[0]; i++) {
      for (let j = 0; j < ITEM_COUNT[1]; j++) {
        if (Math.random() < DISTRIBUTION) {
          const color = colors[Math.floor(Math.random() * colors.length)];
          this.list.push({
            name: `Roster item ${i}-${j}`,
            x: 13 + ITEM_WIDTH * j,
            y: 34 + ITEM_HEIGHT * i,
            width: ITEM_WIDTH,
            height: ITEM_HEIGHT,
            color
          });
        }
      }
    }
  }

  cellRenderer({index, key, style}) {
    const {color} = this.list[index];
    return (
      <div key={key} style={style}>
        <div className="rct9k-items-outer" style={{backgroundColor: color}}>
          {this.list[index].name}
        </div>
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
      <div className="rct9k-timeline-div">
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
