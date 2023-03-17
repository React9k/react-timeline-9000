import Timeline from '../../timeline';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

export class CustomTimeline extends Timeline {
  static propTypes = {
    ...super.propTypes,
    /**
     * @type { JSX.Element }
     */
    toolbarDomElement: PropTypes.object.isRequired
  };

  renderMenuButton() {
    return this.props.toolbarDomElement
      ? ReactDOM.createPortal(super.renderMenuButton(), this.props.toolbarDomElement)
      : super.renderMenuButton();
  }
}
