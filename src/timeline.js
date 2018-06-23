'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {CellMeasurer, CellMeasurerCache, Grid, AutoSizer} from 'react-virtualized';

import interact from 'interactjs';

import './style.css';

const ITEM_COUNT = [5000, 200]; //Rows, Cols
const ITEM_HEIGHT = 40;
const ITEM_WIDTH = 150;

const DISTRIBUTION = 80 / 100;

const cache = new CellMeasurerCache({
  defaultWidth: 100,
  minWidth: 75,
  fixedHeight: true
});

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
      this.list[i] = [];
      for (let j = 0; j < ITEM_COUNT[1]; j++) {
        if (Math.random() < DISTRIBUTION) {
          const color = colors[Math.floor(Math.random() * colors.length)];
          this.list[i][j] = {
            name: `Roster item ${i}-${j}`,
            color
          };
        }
      }
    }
    // this.setUpDragging();
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
    const item = this.list[columnIndex][rowIndex];
    if (item)
      return (
        <div key={key} style={style} className="rct9k-items-outer item_draggable">
          <div className="rct9k-items-inner" style={{backgroundColor: item.color}}>
            {item.name}
          </div>
        </div>
      );
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
              columnCount={ITEM_COUNT[0]}
              columnWidth={ITEM_WIDTH}
              height={height}
              rowCount={ITEM_COUNT[1]}
              rowHeight={ITEM_HEIGHT}
              width={width}
            />
          )}
        </AutoSizer>
      </div>
    );
  }
}
