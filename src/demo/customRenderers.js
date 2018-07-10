import React, {Component} from 'react';

export function customItemRenderer(props) {
  const {item, ...rest} = props;
  return <span {...rest}> Custom </span>;
}

export function customGroupRenderer(props) {
  const {group, ...rest} = props;

  return (
    <span data-group-index={group.id} {...rest}>
      Custom {group.title}
    </span>
  );
}
