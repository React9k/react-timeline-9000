'use strict';
import React from 'react';
import {shallow} from 'enzyme';
import {expect} from 'chai';

import setup from 'setupTests';

import Timeline from 'timeline';

describe('<Timeline/>', function() {
  it('should have text', function() {
    const wrapper = shallow(<Timeline />);
    expect(wrapper.text()).to.equal('Hello');
  });
});
