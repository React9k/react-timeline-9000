import {expect} from 'chai';

import _ from 'lodash';
import moment from 'moment';
import {getMaxOverlappingItems} from './itemUtils';
import {convertDateToMoment} from './timeUtils';

function getStartFromItem(item) {
  return convertDateToMoment(item.start, true);
}

function getEndFromItem(item) {
  return convertDateToMoment(item.end, true);
}

//
// |--1--|
//          |--2--|
//   |--3--|
//       |--4--|
//     |--5--|
const allTestItems = [
  {
    key: '1',
    title: '1',
    color: 'blue',
    row: 1,
    start: moment('2000-01-01'),
    end: moment('2000-01-01').add(1, 'days')
  },
  {
    key: '2',
    title: '2',
    color: 'blue',
    row: 1,
    start: moment('2000-01-03'),
    end: moment('2000-01-03')
      .startOf('day')
      .add(1, 'days')
  },
  {
    key: '3',
    title: '3',
    color: 'blue',
    row: 1,
    start: moment('2000-01-01').add(1, 'hours'),
    end: moment('2000-01-01')
      .add(1, 'hours')
      .add(1, 'days')
  },
  {
    key: '4',
    title: '4',
    color: 'blue',
    row: 1,
    start: moment('2000-01-01').add(1, 'days'),
    end: moment('2000-01-01')
      .add(1, 'hours')
      .add(1, 'days')
  },
  {
    key: '5',
    title: '5',
    color: 'blue',
    row: 1,
    start: moment('2000-01-01').add(2, 'hours'),
    end: moment('2000-01-01')
      .add(2, 'hours')
      .add(1, 'days')
  }
];

describe('Item Utils', function() {
  describe('getMaxOverlappingItems', function() {
    it('should return a default of 1', function() {
      const result = getMaxOverlappingItems([], getStartFromItem, getEndFromItem);
      expect(result).to.equal(1);
    });
    // Diagram
    //  |-----|  |----|
    it('should return 1 when no overlapping items', function() {
      let testInstanceIDs = ['1', '2'];
      let items = _.filter(allTestItems, i => {
        return _.includes(testInstanceIDs, i.key);
      });
      const result = getMaxOverlappingItems(items, getStartFromItem, getEndFromItem);
      expect(result).to.equal(1);
    });
    // Diagram
    //  |-----|
    //    |------|
    it('should return 2 when 2 items overlap', () => {
      let testInstanceIDs = ['1', '3'];
      let items = _.filter(allTestItems, i => {
        return _.includes(testInstanceIDs, i.key);
      });
      const result = getMaxOverlappingItems(items, getStartFromItem, getEndFromItem);
      expect(result).to.equal(2);
    });
    // Diagram
    //  |-----|-----|
    it('should return 1 when 2 items touch', () => {
      let testInstanceIDs = ['1', '4'];
      let items = _.filter(allTestItems, i => {
        return _.includes(testInstanceIDs, i.key);
      });
      const result = getMaxOverlappingItems(items, getStartFromItem, getEndFromItem);
      expect(result).to.equal(1);
    });
    // Diagram
    //  |-----|
    //    |------|
    //       |------|
    it('should return 3 when 3 items overlap', () => {
      let testInstanceIDs = ['1', '3', '5'];
      let items = _.filter(allTestItems, i => {
        return _.includes(testInstanceIDs, i.key);
      });
      const result = getMaxOverlappingItems(items, getStartFromItem, getEndFromItem);
      expect(result).to.equal(3);
    });
    // Diagram
    //  |-----|  |------|
    //      |------|
    it('should return 2 when 2 of 3 items overlap', () => {
      let testInstanceIDs = ['2', '3', '4'];
      let items = _.filter(allTestItems, i => {
        return _.includes(testInstanceIDs, i.key);
      });
      const result = getMaxOverlappingItems(items, getStartFromItem, getEndFromItem);
      expect(result).to.equal(2);
    });
  });
});
