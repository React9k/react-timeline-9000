'use strict';

import PropTypes from 'prop-types';
import React, {Component} from 'react';

import TimeTics from './timeTics';

export default class TimelineRibbon extends Component {
  static propTypes = {
    start: PropTypes.object.isRequired, //moment
    end: PropTypes.object.isRequired //moment
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="rct-timeline-ribbon-div">
        <TimeTics />
        <TimeTics />
      </div>
    );
  }
}
