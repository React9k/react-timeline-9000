import React from 'react';
import {Group} from '../index';

/**
 * Group (row) renderer class
 * @param { object } props - Component props
 * @param { string } props.labelProperty - The key of the data from group that should be rendered
 * @param { Group } props.group - The group to be rendered
 * @param { string } props.group.id - The group's id
 */
export class GroupRenderer extends React.Component {
  /**
   * Returns the label of the cell.
   * @returns { string }
   */
  getLabel() {
    return this.props.group[this.props.labelProperty];
  }

  render() {
    return (
      <span data-group-index={this.props.group.id}>
        <span>{this.getLabel()}</span>
      </span>
    );
  }
}
