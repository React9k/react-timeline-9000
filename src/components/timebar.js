'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import {intToPix} from '../utils/commonUtils';
import {timebarFormat as defaultTimebarFormat} from '../consts/timebarConsts';

/**
 * Timebar component - displays the current time on top of the timeline
 */
export default class Timebar extends React.Component {
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
  /**
   * On new props we check if a resolution is given, and if not we guess one
   * @param {Object} nextProps Props coming in
   */
  componentWillReceiveProps(nextProps) {
    if (nextProps.top_resolution && nextProps.bottom_resolution) {
      this.setState({resolution: {top: nextProps.top_resolution, bottom: nextProps.bottom_resolution}});
    } else {
      this.guessResolution(nextProps.start, nextProps.end);
    }
  }

  /**
   * Attempts to guess the resolution of the top and bottom halves of the timebar based on the viewable date range.
   * Sets resolution to state.
   * @param {moment} start Start date for the timebar
   * @param {moment} end End date for the timebar
   */
  guessResolution(start, end) {
    if (!start || !end) {
      start = this.props.start;
      end = this.props.end;
    }
    const durationSecs = end.diff(start, 'seconds');
    //    -> 1h
    if (durationSecs <= 60 * 60) this.setState({resolution: {top: 'hour', bottom: 'minute'}});
    // 1h -> 3d
    else if (durationSecs <= 24 * 60 * 60 * 3) this.setState({resolution: {top: 'day', bottom: 'hour'}});
    // 1d -> 30d
    else if (durationSecs <= 30 * 24 * 60 * 60) this.setState({resolution: {top: 'month', bottom: 'day'}});
    //30d -> 1y
    else if (durationSecs <= 365 * 24 * 60 * 60) this.setState({resolution: {top: 'year', bottom: 'month'}});
    // 1y ->
    else this.setState({resolution: {top: 'year', bottom: 'year'}});
  }

  /**
   * Renderer for top bar.
   * @returns {Object} JSX for top menu bar - based of time format & resolution
   */
  renderTopBar() {
    let res = this.state.resolution.top;
    return this.renderBar({format: this.props.timeFormats.majorLabels[res], type: res});
  }
  /**
   * Renderer for bottom bar.
   * @returns {Object} JSX for bottom menu bar - based of time format & resolution
   */
  renderBottomBar() {
    let res = this.state.resolution.bottom;
    return this.renderBar({format: this.props.timeFormats.minorLabels[res], type: res});
  }
  /**
   * Gets the number of pixels per segment of the timebar section (using the resolution)
   * @param {moment} date The date being rendered. This is used to figure out how many days are in the month
   * @param {string} resolutionType Timebar section resolution [Year; Month...]
   * @returns {number} The number of pixels per segment
   */
  getPixelIncrement(date, resolutionType, offset = 0) {
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
        inc = pixels_per_min * 60 * 24 * (daysInYear - offset);
        break;
      case 'month':
        inc = pixels_per_min * 60 * 24 * (date.daysInMonth() - offset);
        break;
      case 'day':
        inc = pixels_per_min * 60 * (24 - offset);
        break;
      case 'hour':
        inc = pixels_per_min * (60 - offset);
        break;
      case 'minute':
        inc = pixels_per_min - offset;
        break;
      default:
        break;
    }
    return Math.min(inc, width);
  }
  /**
   * Renders an entire segment of the timebar (top or bottom)
   * @param {string} resolution The resolution to render at [Year; Month...]
   * @returns {Object[]} A list of sections (making up a segment) to be rendered
   * @property {string} label The text displayed in the section (usually the date/time)
   * @property {boolean} isSelected Whether the section is being 'touched' when dragging/resizing
   * @property {number} size The number of pixels the segment will take up
   * @property {number|string} key Key for react
   */
  renderBar(resolution) {
    const {start, end, selectedRanges} = this.props;
    const width = this.props.width - this.props.leftOffset;

    let currentDate = start.clone();
    let timeIncrements = [];
    let pixelsLeft = width;
    let labelSizeLimit = 60;
    if (resolution.type === 'year') {
      while (currentDate.isBefore(end) && pixelsLeft > 0) {
        let offset = 0;
        // if this is the first 'block' it may be cut off at the start
        if (pixelsLeft === width) {
          offset = currentDate.month(); // month
        }
        let pixelIncrements = this.getPixelIncrement(currentDate, resolution.type, offset);
        const labelSize = pixelIncrements < labelSizeLimit ? 'short' : 'long';
        let label = currentDate.format(resolution.format[labelSize]);
        let isSelected = _.some(selectedRanges, s => {
          return (
            currentDate.isSameOrAfter(s.start.clone().startOf('year')) &&
            currentDate.isSameOrBefore(s.end.clone().startOf('year'))
          );
        });
        timeIncrements.push({label, isSelected, size: pixelIncrements, key: currentDate.unix()});
        currentDate.add(1, 'year').add(-1 * offset, 'months');
        pixelsLeft -= pixelIncrements;
      }
    }
    if (resolution.type === 'month') {
      while (currentDate.isBefore(end) && pixelsLeft > 0) {
        let offset = 0;
        if (pixelsLeft === width) {
          offset = currentDate.date() - 1; // day of month [date is 1 indexed]
        }
        let pixelIncrements = this.getPixelIncrement(currentDate, resolution.type, offset);
        const labelSize = pixelIncrements < labelSizeLimit ? 'short' : 'long';
        let label = currentDate.format(resolution.format[labelSize]);
        let isSelected = _.some(selectedRanges, s => {
          return (
            currentDate.isSameOrAfter(s.start.clone().startOf('month')) &&
            currentDate.isSameOrBefore(s.end.clone().startOf('month'))
          );
        });
        timeIncrements.push({label, isSelected, size: pixelIncrements, key: currentDate.unix()});
        currentDate.add(1, 'month').add(-1 * offset, 'days');
        pixelsLeft -= pixelIncrements;
      }
    }
    if (resolution.type === 'day') {
      let offset = 0;
      // if this is the first 'block' it may be cut off at the start
      if (pixelsLeft === width) {
        offset = currentDate.hour(); // hour of day
      }
      let pixelIncrements = this.getPixelIncrement(currentDate, resolution.type, offset);
      const labelSize = pixelIncrements < labelSizeLimit ? 'short' : 'long';
      while (currentDate.isBefore(end) && pixelsLeft > 0) {
        let label = currentDate.format(resolution.format[labelSize]);
        let isSelected = _.some(selectedRanges, s => {
          return (
            currentDate.isSameOrAfter(s.start.clone().startOf('day')) &&
            currentDate.isSameOrBefore(s.end.clone().startOf('day'))
          );
        });
        timeIncrements.push({label, isSelected, size: pixelIncrements, key: currentDate.unix()});
        currentDate.add(1, 'days').add(-1 * offset, 'hours');
        pixelsLeft -= pixelIncrements;
      }
    } else if (resolution.type === 'hour') {
      let offset = 0;
      // if this is the first 'block' it may be cut off at the start
      if (pixelsLeft === width) {
        offset = currentDate.minute(); // minute of hour
      }
      let pixelIncrements = this.getPixelIncrement(currentDate, resolution.type, offset);
      const labelSize = pixelIncrements < labelSizeLimit ? 'short' : 'long';
      while (currentDate.isBefore(end) && pixelsLeft > 0) {
        let label = currentDate.format(resolution.format[labelSize]);
        let isSelected = _.some(selectedRanges, s => {
          return (
            currentDate.isSameOrAfter(s.start.clone().startOf('hour')) &&
            currentDate.isSameOrBefore(s.end.clone().startOf('hour'))
          );
        });
        timeIncrements.push({label, isSelected, size: pixelIncrements, key: currentDate.unix()});
        currentDate.add(1, 'hours').add(-1 * offset, 'minutes');
        pixelsLeft -= pixelIncrements;
      }
    } else if (resolution.type === 'minute') {
      let pixelIncrements = this.getPixelIncrement(currentDate, resolution.type);
      const labelSize = pixelIncrements < labelSizeLimit ? 'short' : 'long';
      while (currentDate.isBefore(end) && pixelsLeft > 0) {
        let label = currentDate.format(resolution.format[labelSize]);
        let isSelected = _.some(selectedRanges, s => {
          return (
            currentDate.isSameOrAfter(s.start.clone().startOf('minute')) &&
            currentDate.isSameOrBefore(s.end.clone().startOf('minute'))
          );
        });
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

  /**
   * Renders the timebar
   * @returns {Object} Timebar component
   */
  render() {
    const {cursorTime} = this.props;
    const topBarComponent = this.renderTopBar();
    const bottomBarComponent = this.renderBottomBar();

    // Only show the cursor on 1 of the top bar segments
    // Pick the segment that has the biggest size
    let topBarCursorKey = null;
    if (topBarComponent.length > 1 && topBarComponent[1].size > topBarComponent[0].size)
      topBarCursorKey = topBarComponent[1].key;
    else if (topBarComponent.length > 0) topBarCursorKey = topBarComponent[0].key;

    return (
      <div className="rct9k-timebar-outer" style={{width: this.props.width, paddingLeft: this.props.leftOffset}}>
        <div className="rct9k-timebar-inner rct9k-timebar-inner-top">
          {_.map(topBarComponent, i => {
            let topLabel = i.label;
            if (cursorTime && i.key === topBarCursorKey) {
              topLabel += ` [${cursorTime}]`;
            }
            let className = 'rct9k-timebar-item';
            if (i.isSelected) className += ' rct9k-timebar-item-selected';
            return (
              <span className={className} key={i.key} style={{width: intToPix(i.size)}}>
                {topLabel}
              </span>
            );
          })}
        </div>
        <div className="rct9k-timebar-inner rct9k-timebar-inner-bottom">
          {_.map(bottomBarComponent, i => {
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

Timebar.propTypes = {
  cursorTime: PropTypes.any,
  start: PropTypes.object.isRequired, //moment
  end: PropTypes.object.isRequired, //moment
  width: PropTypes.number.isRequired,
  leftOffset: PropTypes.number,
  top_resolution: PropTypes.string,
  bottom_resolution: PropTypes.string,
  selectedRanges: PropTypes.arrayOf(PropTypes.object), // [start: moment ,end: moment (end)]
  timeFormats: PropTypes.object
};
Timebar.defaultProps = {
  selectedRanges: [],
  leftOffset: 0,
  timeFormats: defaultTimebarFormat
};
