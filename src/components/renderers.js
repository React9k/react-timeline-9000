import React from 'react';

export const DefaultItemRenderer = props => {
  const {item, ...rest} = props;

  return <span {...rest}><span>{item.title}</span></span>;
};

export const DefaultGroupRenderer = props => {
  const {group, ...rest} = props;

  return (
    <span data-group-index={group.id} {...rest}>
      <span>{group.title}</span>
    </span>
  );
};
