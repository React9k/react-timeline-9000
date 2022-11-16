import React from 'react';
import PropTypes from 'prop-types';

/**
 * @param { Marker.propTypes } props
 */
const Marker = props => {
  const {height, left, top} = props;
  return <div className="rct9k-marker-overlay" style={{height, left, top}} />;
};

Marker.propTypes = {
  /**
   * @type { number }
   */
  height: PropTypes.number.isRequired,

  /**
   * @type { number }
   */
  left: PropTypes.number.isRequired,

  /**
   * @type { number }
   */
  top: PropTypes.number.isRequired
};

export default Marker;
