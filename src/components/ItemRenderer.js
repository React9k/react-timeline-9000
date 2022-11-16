import React from 'react';
import PropTypes from 'prop-types';
import Color from 'color';

const ITEM_RENDERER_CLS = 'rct9k-item-renderer';
const ITEM_RENDERER_GLOW_CLS = 'rct9k-item-glow';

/**
 * Item (segment) renderer. All the properties of an item are copied as properties of this component. Hence the component
 * doesn't use the property `item`.
 *
 * All the properties have corresponding getter methods. We "OOP-ize" them, for the case where a subclass wants to "override" a property.
 * Without this pattern, such an override is not doable in React.
 * @typedef { import('../types').Item } Item
 * @extends React.Component<ItemRenderer.propTypes>
 */
export default class ItemRenderer extends React.Component {
  static propTypes = {
    /**
     * It's passed by the parent. Though not used by this component. It exists because maybe subclasses want to use it.
     * @type { Item }
     */
    item: PropTypes.object,

    /**
     * The title (label) of the segment (item).
     * @type { string }
     */
    title: PropTypes.string,

    /**
     * Tooltip displayed on mouse over the segment (item).
     * @type { string }
     */
    tooltip: PropTypes.string,

    /**
     * The height of the segment (item).
     *
     * This property is received from the parent and its based on `itemHeight` from `Timeline`. The parent adds a padding
     * (@see rct9k-items-inner class) which must be subtracted from `itemHeight` resulting in `height`.
     *
     * NOTE: If you override the getter, the maximum `height` can be `itemHeight` minus the padding.
     * @type { string | number }
     */
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    /**
     * Used to show a glow effect around the segment (item) when the mouse is moved over the segment (item).
     * @type { boolean }
     */
    glowOnHover: PropTypes.bool,

    /**
     * The renderer uses a **linear gradient** (top to bottom) as a background. The gradient is configured
     * using two colors: a base color (`color`) and the base color lightened by a percentage (`gradientBrightness`).
     * @type { string }
     */
    color: PropTypes.string,

    /**
     * A number between 0 and 100; it represents the percentage by which `color` is lightened to obtain the second color used in the gradient.
     * @type { number }
     * /
    gradientBrightness: PropTypes.number,

    /**
     * A number between 0 and 100 (percentage from the height of the item) and it represents the point where the first color stops in the gradient.
     * @type { number }
     */
    gradientStop: PropTypes.number,

    /**
     * Default order of the colors in the gradient: lighter color, base color.
     * If `true`, the order of the colors will be reversed.
     * @type { boolean }
     */
    gradientReverseDirection: PropTypes.bool,

    /**
     * The style of the segment used to render the segment (item).
     * @type { object }
     */
    style: PropTypes.object,

    /**
     * Class name used to render the segment (item).
     * @type { string }
     */
    className: PropTypes.string
  };

  static defaultProps = {
    color: '#3791D4',
    glowOnHover: true,
    gradientBrightness: 45,
    gradientStop: 40,
    gradientReverseDirection: false,
    title: undefined,
    tooltip: undefined,
    className: undefined,
    style: {},
    item: {}
  };

  /**
   * Getter for the corresponding prop, to allow override by subclass.
   * @returns { string | JSX.Element }
   */
  getTitle() {
    return this.props.title;
  }

  /**
   * Getter for the corresponding prop, to allow override by subclass.
   * @returns { string }
   */
  getTooltip() {
    return this.props.tooltip;
  }

  /**
   * Getter for the corresponding prop, to allow override by subclass.
   * @returns { string | number }
   */
  getHeight() {
    return this.props.height;
  }

  /**
   * Getter for the corresponding prop, to allow override by subclass.
   * @returns { string }
   */
  getColor() {
    return this.props.color;
  }

  /**
   * Getter for the corresponding prop, to allow override by subclass.
   * @returns { number }
   */
  getGradientBrightness() {
    return this.props.gradientBrightness;
  }

  /**
   * Getter for the corresponding prop, to allow override by subclass.
   * @returns { number }
   */
  getGradientStop() {
    return this.props.gradientStop;
  }

  /**
   * Getter for the corresponding prop, to allow override by subclass.
   * @returns { boolean }
   */
  getGradientReverseDirection() {
    return this.props.gradientReverseDirection;
  }

  /**
   * Returns the color of the text. This method returns 'white' when the background is darker,
   * otherwise returns black.
   * @returns {string}
   */
  getTextColor() {
    return Color(this.getColor()).light() ? 'black' : 'white';
  }

  /**
   * Create a linear gradient using the base color (calls getColor()) and a color obtained adjusting
   * the brightness of that color using getGradientBrightness(). The default order of the colors is
   * [brighter gradient color, gradient color]; this order can be reversed if getGradientReverseDirection() is true.
   *
   * By default, the background of an item uses a linear gradient, this method should be overriden if this behaviour is not wanted.
   * @returns {string} linear gradient
   */
  getBackgroundGradient() {
    let colors = [
      Color(this.getColor())
        .lightness(this.getGradientBrightness())
        .hexString(),
      this.getColor()
    ];
    if (this.getGradientReverseDirection()) {
      colors.reverse();
    }

    return 'linear-gradient(' + colors[0] + ' ' + this.getGradientStop() + '%, ' + colors[1] + ')';
  }

  /**
   * Returns the style of the item.
   * @returns { object }
   */
  getStyle() {
    return {
      ...this.props.style,
      color: this.getTextColor(),
      height: this.getHeight(),
      background: this.getBackgroundGradient()
    };
  }

  /**
   * Returns a css class used to apply glow on item hover.
   * @returns { string }
   */
  getGlowOnHoverClassName() {
    return this.props.glowOnHover ? ITEM_RENDERER_GLOW_CLS : '';
  }

  /**
   * Returns the css classes applied on the item.
   * @returns { string }
   */
  getClassName() {
    return ITEM_RENDERER_CLS + ' ' + this.props.className + ' ' + this.getGlowOnHoverClassName();
  }

  render() {
    return (
      <span className={this.getClassName()} style={this.getStyle()} title={this.getTooltip()}>
        <span className="rct9k-item-renderer-inner">{this.getTitle()}</span>
      </span>
    );
  }
}
