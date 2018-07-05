'use strict';
// Component to show a selection box (like on windows desktop)

import React from 'react';
import PropTypes from 'prop-types';

export default class SelectBox extends React.Component {
  componentDidMount() {
    this.dx = 0;
    this.dy = 0;
  }

  start(x, y) {
    this.startX = x;
    this.startY = y;
    this.dx = 0;
    this.dy = 0;
  }
  move(dx, dy) {
    this.dx += dx;
    this.dy += dy;
    this.forceUpdate();
  }
  end() {
    let toReturn = {top: this.startY, left: this.startX, width: this.dx, height: this.dy};
    this.startX = 0;
    this.startY = 0;
    this.dx = 0;
    this.dy = 0;
    this.forceUpdate();
    return toReturn;
  }

  render() {
    const {startX, startY, dx, dy} = this;
    let style = {left: startX || 0, top: startY || 0};
    //matrix(scaleX(),skewY(),skewX(),scaleY(),translateX(),translateY())
    style['transform'] = style['WebkitTransform'] = `matrix(${dx}, 0, 0, ${dy}, ${dx / 2}, ${dy / 2})`;
    return <div className="rct9k-selector-outer" style={style} />;
  }
}
