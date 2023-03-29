import React from 'react';
import PropTypes from 'prop-types';
import {convertDateToMoment} from '../utils/timeUtils';

/**
 * @extends React.Component<HighlightedInterval.propTypes>
 */
export class HighlightedInterval extends React.Component {
  static propTypes = {
    /**
     * Start of the highlighted interval, as date (numeric/millis or moment object, cf. `Timeline.props.useMoment`).
     *
     * @type { object | number }
     */
    start: PropTypes.oneOfType([PropTypes.object, PropTypes.number]).isRequired,

    /**
     * End of the highlighted interval, as date (numeric/millis or moment object, cf. `Timeline.props.useMoment`).
     *
     * @type { object | number}
     */
    end: PropTypes.oneOfType([PropTypes.object, PropTypes.number]).isRequired,

    /**
     * Class name used to render the interval.
     *
     * @type { string }
     */
    className: PropTypes.string,

    /**
     * Style used to render the interval.
     *
     * @type { object }
     */
    style: PropTypes.object,

    /**
     * Internal (passed by parent). The height of the highlighted interval.
     *
     * @type { number }
     */
    height: PropTypes.number,

    /**
     * Internal (passed by parent). `HighlightedInterval` uses absolute positioning, thus it needs the `top` property
     * to set the top edge if the element.
     *
     * @type { number }
     */
    top: PropTypes.number,

    /**
     * Internal (passed by parent). This function allows the conversion of `start`/`end` (time) properties to pixels.
     *
     * @type { Function }
     */
    calculateHorizontalPosition: PropTypes.func.isRequired,

    /**
     * Internal (passed by parent). If true timeline will try to minimize re-renders (e.g: the displayed timeline interval changes).
     *
     * @type { boolean }
     */
    shouldUpdate: PropTypes.bool
  };

  static defaultProps = {
    className: '',
    style: {},
    height: undefined,
    top: undefined,
    calculateHorizontalPosition: () => {},
    shouldUpdate: false
  };

  shouldComponentUpdate(nextProps) {
    if (
      nextProps.shouldUpdate ||
      this.props.height !== nextProps.height ||
      this.props.top !== nextProps.top ||
      !convertDateToMoment(this.props.start).isSame(convertDateToMoment(nextProps.start).valueOf()) ||
      !convertDateToMoment(this.props.end).isSame(convertDateToMoment(nextProps.end))
    ) {
      return true;
    }
    return false;
  }

  /**
   * @returns { object } style
   */
  getStyle() {
    const {left, width} = this.props.calculateHorizontalPosition(this.props.start, this.props.end);
    return {
      ...this.props.style,
      left,
      width,
      top: this.props.top,
      height: this.props.height,
      display: left && width ? 'block' : 'none'
    };
  }

  /**
   * @returns { string } className
   */
  getClassName() {
    return `rct9k-highlighted-interval ${this.props.className}`;
  }

  render() {
    return <div className={this.getClassName()} style={this.getStyle()} />;
  }
}
