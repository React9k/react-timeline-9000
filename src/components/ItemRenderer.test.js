'use strict';
import React from 'react';
import {shallow} from 'enzyme';
import {expect} from 'chai';

import ItemRenderer from './ItemRenderer';

describe('Item renderer', () => {
  it('should render the item', () => {
    const item = {title: 'my_test'};
    const component = shallow(<ItemRenderer {...item} item={item} />);
    expect(component.text()).to.contain('my_test');
  });
});
