import React from 'react';
import PropTypes from 'prop-types';

import _ from 'lodash';

export default class Timebar extends React.Component {
  static propTypes = {
    start: PropTypes.object.isRequired, //moment
    end: PropTypes.object.isRequired, //moment
    leftOffset: PropTypes.number,
    top_resolution: PropTypes.string,
    bottom_resolution: PropTypes.string,
    selectedRanges: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.object)) // [[moment (start), moment (end)]]
  };
  static defaultProps = {
    selectedRanges: [],
    leftOffset: 0
  };

  constructor(props) {
    super(props);
    this.state = {};

    this.guessResolution = this.guessResolution.bind(this);
    this.renderBar = this.renderBar.bind(this);
    this.renderTopBar = this.renderTopBar.bind(this);
    this.renderBottomBar = this.renderBottomBar.bind(this);
  }

  componentWillMount() {
    this.guessResolution();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.top_resolution && nextProps.bottom_resolution) {
      this.setState({resolution: {top: nextProps.top_resolution, bottom: nextProps.bottom_resolution}});
    } else {
      this.guessResolution();
    }
  }

  // Might need to move to utils
  guessResolution() {
    //TODO:
    this.setState({resolution: {top: 'hour', bottom: 'hour'}});
  }

  renderTopBar() {
    return this.renderBar('t');
  }
  renderBottomBar() {
    return this.renderBar('b');
  }

  renderBar(location) {
    const resolution = location === 't' ? this.state.resolution.top : this.state.resolution.bottom;
    const {start, end} = this.props;

    let currentDate = start.clone();
    let timeIncrements = [];
    if (resolution === 'day') {
      while (currentDate.isBefore(end)) {
        timeIncrements.push(currentDate.date());
        currentDate.add(1, 'days');
      }
    } else if (resolution === 'hour') {
      while (currentDate.isBefore(end)) {
        timeIncrements.push(currentDate.hour());
        currentDate.add(1, 'hours');
      }
    }
    console.log(timeIncrements);
    return timeIncrements;
  }

  render() {
    return (
      <div className="rct9k-timebar-outer" style={{width: this.props.width, paddingLeft: this.props.leftOffset}}>
        <div className="rct9k-timebar-inner-top">
          {_.map(this.renderTopBar(), i => {
            return (
              <span key={i} style={{width: '74px', display: 'inline-block'}}>
                {i}
              </span>
            );
          })}
        </div>
        <div className="rct9k-timebar-inner-bottom">
          {_.map(this.renderBottomBar(), i => {
            return (
              <span key={i} style={{width: '74px', display: 'inline-block'}}>
                {i}
              </span>
            );
          })}
        </div>
      </div>
    );
  }
}
