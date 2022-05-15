import React from 'react';
import PropTypes from 'prop-types';

const Marker = props => {
  const {height, left, top} = props;
  return <div className="rct9k-marker-overlay" style={{height, left, top}} />;
};

Marker.propTypes = {
  height: PropTypes.number.isRequired,
  left: PropTypes.number.isRequired,
  top: PropTypes.number.isRequired
};

export default Marker;
