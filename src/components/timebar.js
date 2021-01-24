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

    this.guessResolution = this.guessResolution.bind(this);
    this.renderBar = this.renderBar.bind(this);
    this.renderTopBar = this.renderTopBar.bind(this);
    this.renderBottomBar = this.renderBottomBar.bind(this);
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
    if (durationSecs <= 60 * 60) return { top: 'hour', bottom: 'minute'};
    // 1h -> 3d
    else if (durationSecs <= 24 * 60 * 60 * 3) return { top: 'day', bottom: 'hour'};
    // 1d -> 30d
    else if (durationSecs <= 30 * 24 * 60 * 60) return { top: 'month', bottom: 'day'};
    //30d -> 1y
    else if (durationSecs <= 365 * 24 * 60 * 60) return { top: 'year', bottom: 'month'};
    // 1y ->
    else return { top: 'year', bottom: 'year'};
  }

  /**
   * Renderer for top bar.
   * @returns {Object} JSX for top menu bar - based of time format & resolution
   */
  renderTopBar(resolution) {
    let res = resolution.top;
    return this.renderBar({format: this.props.timeFormats.majorLabels[res], type: res});
  }
  /**
   * Renderer for bottom bar.
   * @returns {Object} JSX for bottom menu bar - based of time format & resolution
   */
  renderBottomBar(resolution) {
    let res = resolution.bottom;
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

    function _addTimeIncrement(initialOffset, offsetType, stepFunc) {
      let offset = null;
      while (currentDate.isBefore(end) && pixelsLeft > 0) {
        // if this is the first 'block' it may be cut off at the start
        if (pixelsLeft === width) {
          offset = initialOffset;
        } else {
          offset = moment.duration(0);
        }
        let pixelIncrements = Math.min(
          this.getPixelIncrement(currentDate, resolution.type, offset.as(offsetType)),
          pixelsLeft
        );
        const labelSize = pixelIncrements < labelSizeLimit ? 'short' : 'long';
        let label = currentDate.format(resolution.format[labelSize]);
        let isSelected = _.some(selectedRanges, s => {
          return (
            currentDate.isSameOrAfter(s.start.clone().startOf(resolution.type)) &&
            currentDate.isSameOrBefore(s.end.clone().startOf(resolution.type))
          );
        });
        timeIncrements.push({label, isSelected, size: pixelIncrements, key: pixelsLeft});
        stepFunc(currentDate, offset);
        pixelsLeft -= pixelIncrements;
      }
    }

    const addTimeIncrement = _addTimeIncrement.bind(this);

    if (resolution.type === 'year') {
      const offset = moment.duration(currentDate.diff(currentDate.clone().startOf('year')));
      addTimeIncrement(offset, 'months', (currentDt, offst) => currentDt.subtract(offst).add(1, 'year'));
    } else if (resolution.type === 'month') {
      const offset = moment.duration(currentDate.diff(currentDate.clone().startOf('month')));
      addTimeIncrement(offset, 'days', (currentDt, offst) => currentDt.subtract(offst).add(1, 'month'));
    } else if (resolution.type === 'day') {
      const offset = moment.duration(currentDate.diff(currentDate.clone().startOf('day')));
      addTimeIncrement(offset, 'hours', (currentDt, offst) => currentDt.subtract(offst).add(1, 'days'));
    } else if (resolution.type === 'hour') {
      const offset = moment.duration(currentDate.diff(currentDate.clone().startOf('hour')));
      addTimeIncrement(offset, 'minutes', (currentDt, offst) => currentDt.subtract(offst).add(1, 'hours'));
    } else if (resolution.type === 'minute') {
      addTimeIncrement(moment.duration(0), 'minutes', (currentDt, offst) => currentDt.add(1, 'minutes'));
    }
    return timeIncrements;
  }

  /**
   * Renders the timebar
   * @returns {Object} Timebar component
   */
  render() {
    const {cursorTime} = this.props;
    
    const topResolution = this.props.top_resolution;
    const bottomResolution = this.props.bottom_resolution;

    const resolution = (topResolution && bottomResolution)
      ? { top: topResolution, bottom: bottomResolution }
      : this.guessResolution(this.props.start, this.props.end)
    
    const topBarComponent = this.renderTopBar(resolution);
    const bottomBarComponent = this.renderBottomBar(resolution);
    const GroupTitleRenderer = this.props.groupTitleRenderer;

    // Only show the cursor on 1 of the top bar segments
    // Pick the segment that has the biggest size
    let topBarCursorKey = null;
    if (topBarComponent.length > 1 && topBarComponent[1].size > topBarComponent[0].size)
      topBarCursorKey = topBarComponent[1].key;
    else if (topBarComponent.length > 0) topBarCursorKey = topBarComponent[0].key;

    return (
      <div className="rct9k-timebar">
        <div className="rct9k-timebar-group-title" style={{width: this.props.leftOffset}}>
          <GroupTitleRenderer />
        </div>
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
      </div>
    );
  }
}

Timebar.propTypes = {
  cursorTime: PropTypes.any,
  groupTitleRenderer: PropTypes.func,
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
  groupTitleRenderer: () => <div />,
  leftOffset: 0,
  timeFormats: defaultTimebarFormat
};
