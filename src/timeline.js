'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Collection, AutoSizer} from 'react-virtualized';
import interact from 'interactjs';

import './style.css';

const ITEM_COUNT = [1000, 1000]; //Rows, Cols
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
    this.setUpDragging();
  }

  setUpDragging() {
    function move_style(px_style, delta) {
      px_style = parseInt(px_style.replace('px', ''));
      px_style += delta;
      return px_style + 'px';
    }
    interact('.item_draggable').draggable({
      onmove: e => {
        const index = parseInt(e.target.getAttribute('item-index'));
        this.list[index].x = this.list[index].x + e.dx;
        this.list[index].y = this.list[index].y + e.dy;
        e.target.style.left = move_style(e.target.style.left, e.dx);
        e.target.style.top = move_style(e.target.style.top, e.dy);
      },
      onend: e => {
        // for 1000 by 1000 this takes ~2sec to run
        // hence we only call it on drag end, and 'fake it' when moving
        this._collection.recomputeCellSizesAndPositions();
      }
    });
  }

  cellRenderer({index, key, style}) {
    const item = this.list[index];
    const {color} = item;
    return (
      <div item-index={index} key={key} style={style} className="rct9k-items-outer item_draggable">
        <div className="rct9k-items-inner" style={{backgroundColor: color}}>
          {item.name}
        </div>
      </div>
    );
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
            <Collection
              ref={ref => (this._collection = ref)}
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
