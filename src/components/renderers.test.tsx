'use strict';
import React from 'react';
import {shallow, mount} from 'enzyme';
import '../setupTests';

import {DefaultItemRenderer, DefaultGroupRenderer} from './renderers';

describe('Item renderer', () => {
  it('should render the item', () => {
    const item = {title: 'my_test'};
    const component = shallow(<DefaultItemRenderer item={item} />);
    expect(component.text()).toContain('my_test');
  });
});
describe('Group renderer', () => {
  it('should render the group w/o label property', () => {
    const group = {title: 'my_test'};
    const component = shallow(<DefaultGroupRenderer group={group} />);
    expect(component.text()).toEqual('');
  });
  it('should render the group w/ label property', () => {
    const group = {title: 'my_test'};
    const component = shallow(<DefaultGroupRenderer group={group} labelProperty={'title'} />);
    expect(component.text()).toEqual('my_test');
  });
});
