'use strict';
import React from 'react';

/**
 * Component to show a selection box (like on windows desktop)
 */
export default class SelectBox extends React.Component {
  /**
   * @ignore
   */
  componentDidMount() {
    this.dx = 0;
    this.dy = 0;
    this.startX = 0;
    this.startY = 0;
  }

  /**
   * Create the selection box
   * @param {number} x Starting x coordinate for selection box
   * @param {number} y Starting y coordinate for selection box
   */
  start(x, y) {
    this.startX = x;
    this.startY = y;
    this.dx = 0;
    this.dy = 0;
  }

  /**
   * Update the selection box as the mouse moves
   * @param {number} dx The change in the x coordinate
   * @param {number} dy The change in the y coordinate
   */
  move(dx, dy) {
    this.dx += dx;
    this.dy += dy;
    this.forceUpdate();
  }

  /**
   * Generally on mouse up.
   * Finish the selection box and return the rectangle created
   * @returns {Object} The selection rectangle
   * @property {number} top The top y coordinate
   * @property {number} left The left x coordinate
   * @property {number} width The width of the box
   * @property {number} height The height of the box
   */
  end() {
    let toReturn = {top: this.startY, left: this.startX, width: this.dx, height: this.dy};
    this.startX = 0;
    this.startY = 0;
    this.dx = 0;
    this.dy = 0;
    this.forceUpdate();
    return toReturn;
  }
  /**
   * @ignore
   */
  render() {
    const {startX, startY, dx, dy} = this;
    let style = {left: startX || 0, top: startY || 0};
    style['transform'] = style['WebkitTransform'] = `matrix(${dx}, 0, 0, ${dy}, ${dx / 2}, ${dy / 2})`;
    return <div className="rct9k-selector-outer" style={style} />;
  }
}
