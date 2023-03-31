import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {convertDateToMoment} from '../utils/timeUtils';
import {Marker} from './Marker';
import {HighlightedInterval} from './HighlightedInterval';
import moment from 'moment';

/**
 * @extends React.Component<BackgroundLayer.propTypes>
 */
export class BackgroundLayer extends React.Component {
  static propTypes = {
    /**
     * If `true`, it highlights the weekends.
     *
     * @type { boolean }
     */
    highlightWeekends: PropTypes.bool,

    /**
     * Custom class name for highlighting the weekends.
     *
     * NOTE: No need to provide this; because it has a default class. If a custom class is provided, `!important` should be used to override properties from the default class.
     *
     * @type { string }
     */
    highlightWeekendsClassName: PropTypes.string,

    /**
     * Custom style for highlighting the weekends.
     *
     * NOTE: No need to provide this; because it has a default class.
     *
     * @type { object }
     */
    highlightWeekendsStyle: PropTypes.object,

    /**
     * If `true`, it draws a marker (vertical line) that indicates the current time.
     *
     * @type { boolean }
     */
    nowMarker: PropTypes.bool,

    /**
     * Custom class name for now marker.
     *
     * NOTE: No need to provide this; because it has a default class. If a custom class is provided, `!important` should be used to override properties from the default class.
     *
     * @type { string }
     */
    nowMarkerClassName: PropTypes.string,

    /**
     * Custom style for now marker.
     *
     * NOTE: No need to provide this; because it has a default class.
     *
     * @type { object }
     */
    nowMarkerStyle: PropTypes.object,

    /**
     * If `true`, it draws vertical lines, according to the intervals defined by the bottom `Timebar`.
     *
     * @type { boolean }
     */
    verticalGrid: PropTypes.bool,

    /**
     * Custom class name for vertical grid.
     *
     * NOTE: No need to provide this; because it has a default class. If a custom class is provided, `!important` should be used to override properties from the default class.
     *
     * @type { string }
     */
    verticalGridClassName: PropTypes.string,

    /**
     * Custom style for vertical grid.
     *
     * NOTE: No need to provide this; because it has a default class.
     *
     * @type { object }
     */
    verticalGridStyle: PropTypes.object,

    /**
     * @type { Array.<JSX.Element> }
     */
    markers: PropTypes.arrayOf(PropTypes.object),

    /**
     * @type { Array.<JSX.Element> }
     */
    highlightedIntervals: PropTypes.arrayOf(PropTypes.object),

    /**
     * Internal (passed by parent). Start of the timeline display interval, as date (moment object).
     *
     * @type { object }
     */
    startDateTimeline: PropTypes.object,

    /**
     * Internal (passed by parent). End of the timeline display interval, as date (moment object).
     *
     * @type { object }
     */
    endDateTimeline: PropTypes.object,

    /**
     * Internal (passed by parent). The height of the background layer.
     *
     * @type { number }
     */
    height: PropTypes.number,

    /**
     * Internal (passed by parent). The position of the top edge of background layer.
     *
     * @type { number }
     */
    topOffset: PropTypes.number,

    /**
     * Internal (passed by parent). Total width of the timeline.
     *
     * @type { number }
     */
    width: PropTypes.number,

    /**
     * Internal (passed by parent). The position of the left edge of background layer.
     *
     * @type { number }
     */
    leftOffset: PropTypes.number,

    /**
     * Internal (passed by parent). The vertical lines of the grid are already calculated by `Timerbar`.
     *
     * @type { Array.<object>}
     */
    verticalGridLines: PropTypes.arrayOf(PropTypes.object)
  };

  static defaultProps = {
    highlightWeekends: false,
    highlightWeekendsClassName: undefined,
    highlightWeekendsStyle: undefined,
    nowMarker: false,
    nowMarkerClassName: undefined,
    nowMarkerStyle: undefined,
    verticalGrid: false,
    verticalGridClassName: undefined,
    verticalGridStyle: undefined,
    verticalGridLines: [],
    markers: [],
    highlightedIntervals: [],
    height: undefined,
    topOffset: undefined,
    width: undefined,
    leftOffset: undefined,
    startDateTimeline: undefined,
    endDateTimeline: undefined
  };

  constructor(props) {
    super(props);
    this.state = {verticalLines: [], shouldUpdate: false, weekends: []};
    this.calculateHorizontalPosition = this.calculateHorizontalPosition.bind(this);
  }

  componentDidMount() {
    this.calculateHighlightedWeekends();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.height !== prevProps.height ||
      this.props.width !== prevProps.width ||
      !this.props.startDateTimeline.isSame(prevProps.startDateTimeline) ||
      !this.props.endDateTimeline.isSame(prevProps.endDateTimeline)
    ) {
      this.calculateHighlightedWeekends();
      this.setState({shouldUpdate: true});
      return;
    }
    if (this.state.shouldUpdate) {
      this.setState({shouldUpdate: false});
    }
  }

  /**
   * It calculates the horizontal position (left and width in pixels) of an element from the time positions (start, end).
   * @param { object | number } start
   * @param { object | number } end
   * @returns { object } left position and width in pixels
   */
  calculateHorizontalPosition(start, end) {
    const intervalMillis = this.props.endDateTimeline.diff(this.props.startDateTimeline, 'milliseconds');
    const pixelsPerMillis = (this.props.width - this.props.leftOffset) / intervalMillis;
    const startAsMoment = convertDateToMoment(start);
    const endAsMoment = convertDateToMoment(end);
    if (endAsMoment.isBefore(this.props.startDateTimeline) || startAsMoment.isAfter(this.props.endDateTimeline)) {
      return {};
    }

    let offset = startAsMoment.diff(this.props.startDateTimeline, 'milliseconds');
    let duration = endAsMoment.diff(startAsMoment, 'milliseconds');
    const left = this.props.leftOffset + offset * pixelsPerMillis;
    let width = Math.round(duration * pixelsPerMillis);
    return {left, width};
  }

  /**
   * Calculates the weekend intervals for the timeline displayed interval (`startDateTimeline` - `endDateTimeline`).
   */
  calculateHighlightedWeekends() {
    let weekends = [];
    if (!this.props.highlightWeekends) {
      return;
    }

    let weekendStartDate = this.props.startDateTimeline.clone().startOf('day');
    let weekendEndDate = null;
    // find first weekend day
    while (weekendStartDate.isoWeekday() !== 6 && weekendStartDate.isoWeekday() !== 7) {
      weekendStartDate = weekendStartDate.add(1, 'days');
    }

    // compute all the weekends in the interval
    while (weekendStartDate < this.props.endDateTimeline) {
      if (weekendStartDate.isoWeekday() === 7) {
        weekendEndDate = weekendStartDate.clone().add(1, 'days');
      } else {
        weekendEndDate = weekendStartDate.clone().add(2, 'days');
      }
      weekends.push({
        start: weekendStartDate,
        end: weekendEndDate,
        className: `rct9k-background-layer-highlight-weekends ${this.props.highlightWeekendsClassName}`
      });

      // go to the next weekend
      weekendStartDate = weekendEndDate.clone().add(5, 'days');
    }
    this.setState({weekends: weekends});
  }

  renderHighlightedWeekends() {
    return (
      <Fragment>
        {this.props.highlightWeekends &&
          this.state.weekends.map((weekend, index) => {
            return (
              <HighlightedInterval
                key={index}
                start={weekend.start}
                end={weekend.end}
                className={weekend.className}
                style={this.props.highlightWeekendsStyle}
                top={this.props.topOffset}
                height={this.props.height}
                shouldUpdate={this.state.shouldUpdate}
                calculateHorizontalPosition={this.calculateHorizontalPosition}
              />
            );
          })}
      </Fragment>
    );
  }

  renderCustomComponents(components) {
    return (
      <Fragment>
        {components.map((component, index) => {
          return React.cloneElement(component, {
            key: index,
            height: this.props.height,
            top: this.props.topOffset,
            shouldUpdate: this.state.shouldUpdate,
            calculateHorizontalPosition: this.calculateHorizontalPosition
          });
        })}
      </Fragment>
    );
  }

  renderVerticalGrid() {
    const {verticalGrid, topOffset, height, leftOffset, width, verticalGridLines, verticalGridClassName} = this.props;
    return (
      <Fragment>
        {verticalGrid && verticalGridLines && (
          <div
            className="rct9k-background-layer-vertical-grid"
            style={{top: topOffset, height: height, left: leftOffset, width: width - leftOffset}}>
            {verticalGridLines.map((verticalLine, index) => {
              return (
                <span
                  key={index}
                  className={`rct9k-background-layer-vertical-line ${verticalGridClassName}`}
                  style={{...this.props.verticalGridStyle, width: verticalLine.size}}
                />
              );
            })}
          </div>
        )}
      </Fragment>
    );
  }

  renderNowMarker() {
    const {nowMarker, height, topOffset, nowMarkerClassName} = this.props;
    const currentDate = moment();
    const overlappsDisplayedInterval =
      this.props.startDateTimeline.isSameOrBefore(currentDate) && this.props.endDateTimeline.isSameOrAfter(currentDate);
    return (
      <Fragment>
        {nowMarker && overlappsDisplayedInterval && (
          <Marker
            date={currentDate}
            top={0}
            height={height + topOffset}
            shouldUpdate={this.state.shouldUpdate}
            calculateHorizontalPosition={this.calculateHorizontalPosition}
            className={`rct9k-background-layer-now-marker ${nowMarkerClassName}`}
            style={this.props.nowMarkerStyle}
          />
        )}
      </Fragment>
    );
  }

  render() {
    return (
      <Fragment>
        {this.renderHighlightedWeekends()}
        {this.renderCustomComponents(this.props.highlightedIntervals)}
        {this.renderNowMarker()}
        {this.renderCustomComponents(this.props.markers)}
        {this.renderVerticalGrid()}
      </Fragment>
    );
  }
}
