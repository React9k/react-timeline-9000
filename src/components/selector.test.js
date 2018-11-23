'use strict';
import React from 'react';
import {shallow, mount} from 'enzyme';
import {expect} from 'chai';

import setup from 'setupTests';
import SelectBox from './selector';

describe('Selector', () => {
  it('should initialize to 0,0', () => {
    const component = shallow(<SelectBox />);
    const instance = component.instance();
    expect(instance.startX).to.equal(0);
    expect(instance.startY).to.equal(0);
    expect(instance.curX).to.equal(0);
    expect(instance.curY).to.equal(0);
  });
  it('should set start coordinates correctly', () => {
    const component = shallow(<SelectBox />);
    const instance = component.instance();
    instance.start(33, 44);
    expect(instance.startX).to.equal(33);
    expect(instance.startY).to.equal(44);
    expect(instance.curX).to.equal(0);
    expect(instance.curY).to.equal(0);
  });
  it('should set move coordinates correctly', () => {
    const component = shallow(<SelectBox />);
    const instance = component.instance();
    instance.start(33, 44);
    instance.move(55, 66);
    expect(instance.startX).to.equal(33);
    expect(instance.startY).to.equal(44);
    expect(instance.curX).to.equal(55);
    expect(instance.curY).to.equal(66);
  });
  it('should return correct coordinates on end', () => {
    const component = shallow(<SelectBox />);
    const instance = component.instance();
    instance.start(33, 44);
    instance.move(55, 45);
    const endReturn = instance.end();
    expect(endReturn).to.deep.equal({left: 33, top: 44, width: 22, height: 1});
  });
  it('should reset coordinates on end', () => {
    const component = shallow(<SelectBox />);
    const instance = component.instance();
    instance.start(33, 44);
    instance.move(55, 45);
    const endReturn = instance.end();
    expect(instance.startX).to.equal(0);
    expect(instance.startY).to.equal(0);
    expect(instance.curX).to.equal(0);
    expect(instance.curY).to.equal(0);
  });
});
