'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import _ from 'lodash';
import moment from 'moment';
import {intToPix} from 'utils/commonUtils';
import {timebarFormat as defaultTimebarFormat} from 'consts/timebarConsts';

export default class Timebar extends React.Component {
  static propTypes = {
    start: PropTypes.object.isRequired, //moment
    end: PropTypes.object.isRequired, //moment
    width: PropTypes.number.isRequired,
    leftOffset: PropTypes.number,
    top_resolution: PropTypes.string,
    bottom_resolution: PropTypes.string,
    selectedRanges: PropTypes.arrayOf(PropTypes.object), // [start: moment ,end: moment (end)]
    timeFormats: PropTypes.object
  };
  static defaultProps = {
    selectedRanges: [],
    leftOffset: 0,
    timeFormats: defaultTimebarFormat
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
      this.guessResolution(nextProps.start, nextProps.end);
    }
  }

  guessResolution(start, end) {
    if (!start || !end) {
      start = this.props.start;
      end = this.props.end;
    }
    const durationSecs = end.diff(start, 'seconds');
    //    -> 1h
    if (durationSecs <= 60 * 60) this.setState({resolution: {top: 'hour', bottom: 'minute'}});
    // 1h -> d
    else if (durationSecs <= 24 * 60 * 60 * 3) this.setState({resolution: {top: 'day', bottom: 'hour'}});
    // 1d -> 30d
    else if (durationSecs <= 30 * 24 * 60 * 60) this.setState({resolution: {top: 'month', bottom: 'day'}});
    //30d -> 1y
    else if (durationSecs <= 365 * 24 * 60 * 60) this.setState({resolution: {top: 'year', bottom: 'month'}});
    // 1y ->
    else this.setState({resolution: {top: 'year', bottom: 'year'}});
  }

  renderTopBar() {
    let res = this.state.resolution.top;
    return this.renderBar({format: this.props.timeFormats.majorLabels[res], type: res});
  }
  renderBottomBar() {
    let res = this.state.resolution.bottom;
    return this.renderBar({format: this.props.timeFormats.minorLabels[res], type: res});
  }

  getPixelIncrement(date, resolutionType) {
    const {start, end} = this.props;
    const width = this.props.width - this.props.leftOffset;

    const start_end_min = end.diff(start, 'minutes');
    const pixels_per_min = width / start_end_min;
    function isLeapYear(year) {
      return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
    }
    const daysInYear = isLeapYear(date.year()) ? 366 : 365;
    let inc = width;
    switch (resolutionType) {
      case 'year':
        inc = pixels_per_min * 60 * 24 * daysInYear;
        break;
      case 'month':
        inc = pixels_per_min * 60 * 24 * date.daysInMonth();
        break;
      case 'day':
        inc = pixels_per_min * 60 * 24;
        break;
      case 'hour':
        inc = pixels_per_min * 60;
        break;
      case 'minute':
        inc = pixels_per_min;
        break;
      default:
        break;
    }
    return Math.min(inc, width);
  }
  renderBar(resolution) {
    const {start, end} = this.props;
    const width = this.props.width - this.props.leftOffset;
    let selectedStart = moment('1900-01-01');
    let selectedEnd = moment('1900-01-01');
    if (this.props.selectedRanges[0]) {
      selectedStart = this.props.selectedRanges[0].start;
      selectedEnd = this.props.selectedRanges[0].end;
    }

    let currentDate = start.clone();
    let timeIncrements = [];
    let pixelsLeft = width;
    let labelSizeLimit = 60;
    if (resolution.type === 'year') {
      while (currentDate.isBefore(end) && pixelsLeft > 0) {
        let pixelIncrements = this.getPixelIncrement(currentDate, resolution.type);
        const labelSize = pixelIncrements < labelSizeLimit ? 'short' : 'long';
        let label = currentDate.format(resolution.format[labelSize]);
        let isSelected =
          currentDate.isSameOrAfter(selectedStart.clone().startOf('year')) &&
          currentDate.isSameOrBefore(selectedEnd.clone().startOf('year'));
        timeIncrements.push({label, isSelected, size: pixelIncrements, key: currentDate.unix()});
        currentDate.add(1, 'year');
        pixelsLeft -= pixelIncrements;
      }
    }
    if (resolution.type === 'month') {
      while (currentDate.isBefore(end) && pixelsLeft > 0) {
        let pixelIncrements = this.getPixelIncrement(currentDate, resolution.type);
        const labelSize = pixelIncrements < labelSizeLimit ? 'short' : 'long';
        let label = currentDate.format(resolution.format[labelSize]);
        let isSelected =
          currentDate.isSameOrAfter(selectedStart.clone().startOf('month')) &&
          currentDate.isSameOrBefore(selectedEnd.clone().startOf('month'));
        timeIncrements.push({label, isSelected, size: pixelIncrements, key: currentDate.unix()});
        currentDate.add(1, 'month');
        pixelsLeft -= pixelIncrements;
      }
    }
    if (resolution.type === 'day') {
      let pixelIncrements = this.getPixelIncrement(currentDate, resolution.type);
      const labelSize = pixelIncrements < labelSizeLimit ? 'short' : 'long';
      while (currentDate.isBefore(end) && pixelsLeft > 0) {
        let label = currentDate.format(resolution.format[labelSize]);
        let isSelected =
          currentDate.isSameOrAfter(selectedStart.clone().startOf('day')) &&
          currentDate.isSameOrBefore(selectedEnd.clone().startOf('day'));
        timeIncrements.push({label, isSelected, size: pixelIncrements, key: currentDate.unix()});
        currentDate.add(1, 'days');
        pixelsLeft -= pixelIncrements;
      }
    } else if (resolution.type === 'hour') {
      let pixelIncrements = this.getPixelIncrement(currentDate, resolution.type);
      const labelSize = pixelIncrements < labelSizeLimit ? 'short' : 'long';
      while (currentDate.isBefore(end) && pixelsLeft > 0) {
        let label = currentDate.format(resolution.format[labelSize]);
        let isSelected =
          currentDate.isSameOrAfter(selectedStart.clone().startOf('hour')) &&
          currentDate.isSameOrBefore(selectedEnd.clone().startOf('hour'));
        timeIncrements.push({
          label,
          isSelected,
          size: pixelIncrements,
          key: currentDate.unix()
        });
        currentDate.add(1, 'hours');
        pixelsLeft -= pixelIncrements;
      }
    } else if (resolution.type === 'minute') {
      let pixelIncrements = this.getPixelIncrement(currentDate, resolution.type);
      const labelSize = pixelIncrements < labelSizeLimit ? 'short' : 'long';
      while (currentDate.isBefore(end) && pixelsLeft > 0) {
        let label = currentDate.format(resolution.format[labelSize]);
        let isSelected =
          currentDate.isSameOrAfter(selectedStart.clone().startOf('minute')) &&
          currentDate.isSameOrBefore(selectedEnd.clone().startOf('minute'));
        timeIncrements.push({
          label,
          isSelected,
          size: pixelIncrements,
          key: currentDate.unix()
        });
        currentDate.add(1, 'minutes');
        pixelsLeft -= pixelIncrements;
      }
    }
    return timeIncrements;
  }

  render() {
    return (
      <div className="rct9k-timebar-outer" style={{width: this.props.width, paddingLeft: this.props.leftOffset}}>
        <div className="rct9k-timebar-inner">
          {_.map(this.renderTopBar(), i => {
            let className = 'rct9k-timebar-item';
            if (i.isSelected) className += ' rct9k-timebar-item-selected';
            return (
              <span className={className} key={i.key} style={{width: intToPix(i.size)}}>
                {i.label}
              </span>
            );
          })}
        </div>
        <div className="rct9k-timebar-inner">
          {_.map(this.renderBottomBar(), i => {
            let className = 'rct9k-timebar-item';
            if (i.isSelected) className += ' rct9k-timebar-item-selected';
            return (
              <span className={className} key={i.key} style={{width: intToPix(i.size)}}>
                {i.label}
              </span>
            );
          })}
        </div>
      </div>
    );
  }
}
