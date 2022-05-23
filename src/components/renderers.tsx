/* eslint-disable react/no-multi-comp */
import React, {useMemo} from 'react';

import {RendererTypes} from '../types';

export const DefaultItemRenderer = (props: RendererTypes.ItemRendererProps) => {
  const {item, ...rest} = props;

  return (
    <span {...rest} title={item.tooltip ? item.tooltip : ''}>
      <span className="rct9k-item-renderer-inner">{item.title}</span>
    </span>
  );
};

export const DefaultGroupRenderer = (props: RendererTypes.GroupRendererProps) => {
  const {group, labelProperty} = props;

  const label = useMemo(() => (labelProperty ? group[labelProperty] : group.id), [group, labelProperty]);

  return (
    <span data-group-index={group.id}>
      <span>{label}</span>
    </span>
  );
};

/**
 * Default renderer for column header.
 * @param {object} props - Component props
 * @param {object} props.column - The properties of the column
 * @param {string} props.column.headerLabel - The header's label
 */
export const DefaultColumnHeaderRenderer = (props: any) => {
  const label = useMemo(() => (props.column ? props.column.headerLabel : ''), [props.column]);

  return <span>{label}</span>;
};
