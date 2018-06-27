import {expect} from 'chai';

import moment from 'moment';
import {getMaxOverlappingItems} from './itemUtils';

describe('getMaxOverlappingItems', function() {
  // Diagram
  //
  it('should return a default of 1', function() {
    const result = getMaxOverlappingItems([]);
    expect(result).to.equal(1);
  });
  it('should return 1 when no overlapping items', function() {
    let items = [
      {
        key: '1',
        title: '1',
        color: 'blue',
        row: 1,
        start: moment('2000-01-01').startOf('day'),
        end: moment('2000-01-01')
          .startOf('day')
          .add(1, 'days')
      },
      {
        key: '2',
        title: '2',
        color: 'blue',
        row: 1,
        start: moment('2000-01-03').startOf('day'),
        end: moment('2000-01-03')
          .startOf('day')
          .add(1, 'days')
      }
    ];
    const result = getMaxOverlappingItems(items);
    expect(result).to.equal(1);
  });
  // Diagram
  //  |-----|
  //    |------|
  it('should return 2 when 2 items overlap', () => {
    let items = [
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
        start: moment('2000-01-01').add(1, 'hours'),
        end: moment('2000-01-01')
          .add(1, 'hours')
          .add(1, 'days')
      }
    ];
    const result = getMaxOverlappingItems(items);
    expect(result).to.equal(2);
  });
  // Diagram
  //  |-----|
  //    |------|
  //       |------|
  it('should return 3 when 3 items overlap', () => {
    let items = [
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
        start: moment('2000-01-01').add(1, 'hours'),
        end: moment('2000-01-01')
          .add(1, 'hours')
          .add(1, 'days')
      },
      {
        key: '3',
        title: '3',
        color: 'blue',
        row: 1,
        start: moment('2000-01-01').add(2, 'hours'),
        end: moment('2000-01-01')
          .add(2, 'hours')
          .add(1, 'days')
      }
    ];
    const result = getMaxOverlappingItems(items);
    expect(result).to.equal(3);
  });
  // Diagram
  //  |-----|  |------|
  //      |------|
  it('should return 2 when 2 of 3 items overlap', () => {
    let items = [
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
        start: moment('2000-01-01').add(6, 'hours'),
        end: moment('2000-01-01')
          .add(6, 'hours')
          .add(1, 'days')
      },
      {
        key: '3',
        title: '3',
        color: 'blue',
        row: 1,
        start: moment('2000-01-01')
          .add(1, 'days')
          .add(1, 'hours'),
        end: moment('2000-01-01').add(2, 'days')
      }
    ];
    const result = getMaxOverlappingItems(items);
    expect(result).to.equal(2);
  });
});
