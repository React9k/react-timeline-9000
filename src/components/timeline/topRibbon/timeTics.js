'use strict';

import PropTypes from 'prop-types';
import React, {Component} from 'react';
import _ from 'lodash';

export default class TimeTics extends Component {
  static propTypes = {
    start: PropTypes.object.isRequired, //moment
    end: PropTypes.object.isRequired, //moment
    resolution: PropTypes.string.isRequired //minute; hour; day; month; year
  };
  static defaultProps = {
    resolution: 'day'
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div style={{width: '100%'}}>
        {_.map([1, 2, 3, 4, 5, 6, 7, 8], i => {
          return <span style={{width: '15px', display: 'inline-block'}}>{i}</span>;
        })}
      </div>
    );
  }
}
