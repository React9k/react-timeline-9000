import React from 'react';
import PropTypes from 'prop-types';
import {convertDateToMoment} from '../utils/timeUtils';

/**
 * A `Marker` is a component draws a vertical line.
 *
 * @extends React.Component<Marker.propTypes>
 */
export class Marker extends React.Component {
  static propTypes = {
    /**
     * The position of the marker, as date (numeric/millis or moment object, cf. `Timeline.props.useMoment`).
     *
     * @type { object | number }
     */
    date: PropTypes.oneOfType([PropTypes.object, PropTypes.number]).isRequired,

    /**
     * Class name used to render the marker.
     *
     * @type { string }
     */
    className: PropTypes.string,

    /**
     * Style used to render the marker.
     *
     * @type { object }
     */
    style: PropTypes.object,

    /**
     * Internal (passed by parent). The height of the marker.
     *
     * @type { number }
     */
    height: PropTypes.number,

    /**
     * Internal (passed by parent). `Marker` uses absolute positioning, thus it needs the `top` property
     * to set the top edge if the element.
     *
     * @type { number }
     */
    top: PropTypes.number,

    /**
     * Internal (passed by parent). This function allows the conversion of `date` (time) property to pixels.
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
    style: undefined,
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
      !convertDateToMoment(this.props.date).isSame(convertDateToMoment(nextProps.date).valueOf())
    ) {
      return true;
    }
    return false;
  }

  /**
   * @returns { object } style
   */
  getStyle() {
    const {left} = this.props.calculateHorizontalPosition(this.props.date);
    return {
      ...this.props.style,
      top: this.props.top,
      height: this.props.height,
      left,
      display: left ? 'block' : 'none'
    };
  }

  /**
   * @returns { string } className
   */
  getClassName() {
    return `rct9k-marker ${this.props.className}`;
  }

  render() {
    return <hr className={this.getClassName()} style={this.getStyle()} />;
  }
}
