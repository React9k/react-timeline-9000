'use strict';

import PropTypes from 'prop-types';
import React, {Component} from 'react';

export default class Item extends Component {
  static propTypes = {
    offsetX: PropTypes.number.isRequired,
    offsetY: PropTypes.number.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return <div style={{height: '20px', width: '200px', backgroundColor: 'blue'}}>hello</div>;
  }
}
