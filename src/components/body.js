/**
 * Timeline body/grid
 */

import React from 'react';
import PropTypes from 'prop-types';

import {Grid} from 'react-virtualized';

const TimelineBody = props => {
  const {width, columnWidth, height, rowHeight, rowCount} = props;
  const {grid_ref_callback, cellRenderer, cellRangeRenderer} = props;
  return (
    <Grid
      ref={grid_ref_callback}
      autoContainerWidth
      cellRenderer={cellRenderer}
      cellRangeRenderer={cellRangeRenderer}
      columnCount={2}
      columnWidth={columnWidth}
      height={height}
      rowCount={rowCount}
      rowHeight={rowHeight}
      width={width}
    />
  );
};

TimelineBody.propTypes = {
  width: PropTypes.number.isRequired,
  columnWidth: PropTypes.func.isRequired,
  height: PropTypes.number.isRequired,
  rowHeight: PropTypes.func.isRequired,
  rowCount: PropTypes.number.isRequired,
  grid_ref_callback: PropTypes.func.isRequired,
  cellRenderer: PropTypes.func.isRequired,
  cellRangeRenderer: PropTypes.func.isRequired
};

export default TimelineBody;
