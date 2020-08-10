/**
 * Timeline body/grid
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {Grid} from 'react-virtualized';

class TimelineBody extends Component {
  componentDidMount() {
    this.forceUpdate();
  }
  shouldComponentUpdate(nextProps) {
    const {props} = this;
    if (!props.shallowUpdateCheck) {
      return true;
    }

    // prettier-ignore
    const shallowChange = props.height !== nextProps.height
      || props.width !== nextProps.width
      || props.rowCount !== nextProps.rowCount;

    if (props.forceRedrawFunc) {
      return shallowChange || props.forceRedrawFunc(props, nextProps);
    }

    return shallowChange;
  }
  render() {
    const {width, columnWidth, height, rowHeight, rowCount} = this.props;
    const {grid_ref_callback, cellRenderer} = this.props;

    return (
      <Grid
        ref={grid_ref_callback}
        autoContainerWidth
        cellRenderer={cellRenderer}
        columnCount={2}
        columnWidth={columnWidth}
        height={height}
        rowCount={rowCount}
        rowHeight={rowHeight}
        width={width}
      />
    );
  }
}

TimelineBody.propTypes = {
  width: PropTypes.number.isRequired,
  columnWidth: PropTypes.func.isRequired,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.func]).isRequired,
  rowHeight: PropTypes.func.isRequired,
  rowCount: PropTypes.number.isRequired,
  grid_ref_callback: PropTypes.func.isRequired,
  cellRenderer: PropTypes.func.isRequired,
  shallowUpdateCheck: PropTypes.bool,
  forceRedrawFunc: PropTypes.func
};

TimelineBody.defaultProps = {
  shallowUpdateCheck: false,
  forceRedrawFunc: null
};
export default TimelineBody;
