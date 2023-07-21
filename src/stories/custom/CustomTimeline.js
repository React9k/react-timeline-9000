import PropTypes from 'prop-types';
import Timeline from '../../timeline';
import ReactDOM from 'react-dom';

export class CustomTimeline extends Timeline {
  static propTypes = {
    ...Timeline.propTypes,
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
