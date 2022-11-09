import React from 'react';

/**
 * Renderer for column header.
 * @param {object} props - Component props
 * @param {object} props.column - The properties of the column
 * @param {string} props.column.headerLabel - The header's label
 */
export class ColumnHeaderRenderer extends React.Component {
  /**
   * Returns the label of the header.
   */
  getLabel() {
    return this.props.column ? this.props.column.headerLabel : '';
  }

  render() {
    return <span>{this.getLabel()}</span>;
  }
}
