import React from 'react';
import PropTypes from 'prop-types';

import _ from 'lodash';
import {intToPix} from 'utils/common';

export default class Timebar extends React.Component {
  static propTypes = {
    start: PropTypes.object.isRequired, //moment
    end: PropTypes.object.isRequired, //moment
    width: PropTypes.number.isRequired,
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
    this.setState({resolution: {top: 'day_long', bottom: 'hour'}});
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
    const width = this.props.width - this.props.leftOffset;

    const start_end_min = end.diff(start, 'minutes');
    const pixels_per_min = width / start_end_min;

    let currentDate = start.clone();
    let timeIncrements = [];
    if (resolution.startsWith('day')) {
      let pixelIncrements = pixels_per_min * 60 * 24;
      let pixelsLeft = width;
      while (currentDate.isBefore(end) && pixelsLeft > 0) {
        let label = resolution === 'day_short' ? currentDate.format('D') : currentDate.format('Do MMM Y');
        timeIncrements.push({label, size: pixelIncrements, key: currentDate.unix()});
        currentDate.add(1, 'days');
        pixelsLeft -= pixelIncrements;
      }
    } else if (resolution === 'hour') {
      let pixelIncrements = pixels_per_min * 60;
      while (currentDate.isBefore(end)) {
        timeIncrements.push({label: currentDate.hours() + 'hrs', size: pixelIncrements, key: currentDate.unix()});
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
              <span className="rct9k-timebar-item" key={i.key} style={{width: intToPix(i.size)}}>
                {i.label}
              </span>
            );
          })}
        </div>
        <div className="rct9k-timebar-inner-bottom">
          {_.map(this.renderBottomBar(), i => {
            return (
              <span className="rct9k-timebar-item" key={i.key} style={{width: intToPix(i.size)}}>
                {i.label}
              </span>
            );
          })}
        </div>
      </div>
    );
  }
}
