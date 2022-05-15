'use strict';
import React from 'react';
import {shallow, mount} from 'enzyme';

import '../setupTests';

import SelectBox from './selector';

describe('Selector', () => {
  it('should initialize to 0,0', () => {
    const component = shallow(<SelectBox />);
    const instance = component.instance();
    expect(instance.startX).toEqual(0);
    expect(instance.startY).toEqual(0);
    expect(instance.curX).toEqual(0);
    expect(instance.curY).toEqual(0);
  });
  it('should set start coordinates correctly', () => {
    const component = shallow(<SelectBox />);
    const instance = component.instance();
    instance.start(33, 44);
    expect(instance.startX).toEqual(33);
    expect(instance.startY).toEqual(44);
    expect(instance.curX).toEqual(0);
    expect(instance.curY).toEqual(0);
  });
  it('should set move coordinates correctly', () => {
    const component = shallow(<SelectBox />);
    const instance = component.instance();
    instance.start(33, 44);
    instance.move(55, 66);
    expect(instance.startX).toEqual(33);
    expect(instance.startY).toEqual(44);
    expect(instance.curX).toEqual(55);
    expect(instance.curY).toEqual(66);
  });
  it('should return correct coordinates on end', () => {
    const component = shallow(<SelectBox />);
    const instance = component.instance();
    instance.start(33, 44);
    instance.move(55, 45);
    const endReturn = instance.end();
    expect(endReturn).toEqual({left: 33, top: 44, width: 22, height: 1});
  });
  it('should reset coordinates on end', () => {
    const component = shallow(<SelectBox />);
    const instance = component.instance();
    instance.start(33, 44);
    instance.move(55, 45);
    const endReturn = instance.end();
    expect(instance.startX).toEqual(0);
    expect(instance.startY).toEqual(0);
    expect(instance.curX).toEqual(0);
    expect(instance.curY).toEqual(0);
  });
});
