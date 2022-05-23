'use strict';
import React, {ReactNode} from 'react';

/**
 * Component to show a selection box (like on windows desktop)
 */
export default class SelectBox extends React.Component {
  curX: number = 0;
  curY: number = 0;
  startX: number = 0;
  startY: number = 0;

  /**
   * Create the selection box
   * @param {number} x Starting x coordinate for selection box
   * @param {number} y Starting y coordinate for selection box
   */
  start(x: number, y: number) {
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
  move(x: number, y: number) {
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
  end(): {left: number; top: number; width: number; height: number} {
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
  render(): ReactNode {
    const {startX, startY, curX, curY} = this;
    const left = Math.min(startX, curX);
    const top = Math.min(startY, curY);
    const width = Math.abs(startX - curX);
    const height = Math.abs(startY - curY);
    let style = {left, top, width, height};
    return <div className="rct9k-selector-outer" style={style} />;
  }
}
