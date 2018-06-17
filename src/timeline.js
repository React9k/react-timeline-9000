'use strict';

import PropTypes from 'prop-types';
import React, {Component} from 'react';

import Item from 'components/item';
import TimelineRibbon from 'components/timeline/topRibbon';
import style from './style.css';

export default class Timeline extends Component {
  static propTypes = {};
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="rct-timeline-div">
        <TimelineRibbon />
      </div>
    );
  }
}
