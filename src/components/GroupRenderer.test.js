'use strict';
import React from 'react';
import {shallow} from 'enzyme';
import {expect} from 'chai';
import {GroupRenderer} from './GroupRenderer';

describe('Group renderer', () => {
  it('should render the group w/o label property', () => {
    const group = {title: 'my_test'};
    const component = shallow(<GroupRenderer group={group} />);
    expect(component.text()).to.equals('');
  });
  it('should render the group w/ label property', () => {
    const group = {title: 'my_test'};
    const component = shallow(<GroupRenderer group={group} labelProperty={'title'} />);
    expect(component.text()).to.equals('my_test');
  });
});
