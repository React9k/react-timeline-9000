import React, {Component} from 'react';

export function customItemRenderer(props) {
  const {item, ...rest} = props;
  const text = `${item.start.format('HH:mm')} - ${item.end.format('HH:mm')}`;
  return <span {...rest}> {text} </span>;
}

export function customGroupRenderer(props) {
  const {group, ...rest} = props;

  return (
    <span data-group-index={group.id} {...rest}>
      Custom {group.title}
    </span>
  );
}

export class CustomCellRenderer extends React.Component {
  render() {
    return <span>{this.props.group.description}</span>;
  }
}

export class CustomColumnHeaderRenderer extends React.Component {
  render() {
    return <span>Description</span>;
  }
}
