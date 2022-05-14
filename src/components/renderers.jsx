import React from 'react';

/**
 * Default item renderer class
 * @param {object} props - Component props
 * @param {object} props.item - The item to be rendered
 * @param {string} props.item.title - The item's title
 * @param {?...object} props.rest - Any other arguments for the span tag
 */
export const DefaultItemRenderer = props => {
  const {item, ...rest} = props;

  return (
    <span {...rest} title={item.tooltip ? item.tooltip : ''}>
      <span className="rct9k-item-renderer-inner">{item.title}</span>
    </span>
  );
};

/**
 * Default group (row) renderer class
 * @param {object} props - Component props
 * @param {string} props.labelProperty - The key of the data from group that should be rendered
 * @param {object} props.group - The group to be rendered
 * @param {string} props.group.id - The group's id
 */
export class DefaultGroupRenderer extends React.Component {
  /**
   * Returns the label of the cell.
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

/**
 * Default renderer for column header.
 * @param {object} props - Component props
 * @param {object} props.column - The properties of the column
 * @param {string} props.column.headerLabel - The header's label
 */
export class DefaultColumnHeaderRenderer extends React.Component {
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
