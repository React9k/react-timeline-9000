import React, {Component} from 'react';

export function customItemRenderer(props) {
  const {item, ...rest} = props;
  const text = `${item.start.format('HH:mm')} - ${item.end.format('HH:mm')}`;
  return <span {...rest}> {text} </span>;
}

export function customGroupRenderer(props) {
  const {group, ...rest} = props;

  return (
    <span group-index={group.id} {...rest}>
      Custom {group.title}
    </span>
  );
}
