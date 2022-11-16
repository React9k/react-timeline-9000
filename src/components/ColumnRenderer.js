import React from 'react';

/**
 * Renderer for column header.
 * @typedef { import('../types').Column } Column
 * @param { object } props - Component props
 * @param { Column } props.column - The properties of the column
 * @param { string } props.column.headerLabel - The header's label
 */
export class ColumnHeaderRenderer extends React.Component {
  /**
   * Returns the label of the header.
   * @returns { string }
   */
  getLabel() {
    return this.props.column ? this.props.column.headerLabel : '';
  }

  render() {
    return <span>{this.getLabel()}</span>;
  }
}
