import React from 'react';

export const DefaultItemRenderer = props => {
  const {item, ...rest} = props;

  return <span {...rest}>{item.title}</span>;
};

export const DefaultGroupRenderer = props => {
  const {group, ...rest} = props;

  return (
    <span data-group-index={group.id} {...rest}>
      {group.title}
    </span>
  );
};
