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
    this.curX = 0;
    this.curY = 0;
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
    this.curX = 0;
    this.curY = 0;
  }

  /**
   * Update the selection box as the mouse moves
   * @param {number} x The current X coordinate of the mouse
   * @param {number} y The current Y coordinate of the mouse
   */
  move(x, y) {
    this.curX = x;
    this.curY = y;
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
    const {startX, startY, curX, curY} = this;
    const left = Math.min(startX, curX);
    const top = Math.min(startY, curY);
    const width = Math.abs(startX - curX);
    const height = Math.abs(startY - curY);
    let toReturn = {left, top, width, height};

    this.startX = 0;
    this.startY = 0;
    this.curX = 0;
    this.curY = 0;
    this.forceUpdate();
    return toReturn;
  }

  /**
   * @ignore
   */
  render() {
    const p = n => (Number.isNaN(n) ? 0 : n);
    const {startX, startY, curX, curY} = this;
    const left = p(Math.min(startX, curX));
    const top = p(Math.min(startY, curY));
    const width = p(Math.abs(startX - curX));
    const height = p(Math.abs(startY - curY));
    let style = {left, top, width, height};
    return <div className="rct9k-selector-outer" style={style} />;
  }
}
