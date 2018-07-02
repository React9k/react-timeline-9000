import {expect} from 'chai';

import _ from 'lodash';
import moment from 'moment';
import {timeSnap} from './timeUtils';

describe('Time Utils', function() {
  describe('timeSnap', function() {
    it('should round up to the nearest min', function() {
      const testTime = moment('2000-01-01 9:59:50 Z', 'YYYY-MM-DD H:m:s Z');
      const expectedTime = moment('2000-01-01 10:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      const snap = 60;
      const actualTime = timeSnap(testTime, snap);
      expect(actualTime.unix()).to.equal(expectedTime.unix());
    });
    it('should round down to the nearest min', function() {
      const testTime = moment('2000-01-01 10:00:20 Z', 'YYYY-MM-DD H:m:s Z');
      const expectedTime = moment('2000-01-01 10:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      const snap = 60;
      const actualTime = timeSnap(testTime, snap);
      expect(actualTime.unix()).to.equal(expectedTime.unix());
    });
    it('should round up when at 30s (nearest min)', function() {
      const testTime = moment('2000-01-01 10:00:30 Z', 'YYYY-MM-DD H:m:s Z');
      const expectedTime = moment('2000-01-01 10:01:00 Z', 'YYYY-MM-DD H:m:s Z');
      const snap = 60;
      const actualTime = timeSnap(testTime, snap);
      expect(actualTime.unix()).to.equal(expectedTime.unix());
    });
    it('should round to nearest hour', function() {
      const testTime = moment('2000-01-01 10:12:30 Z', 'YYYY-MM-DD H:m:s Z');
      const expectedTime = moment('2000-01-01 10:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      const snap = 60 * 60;
      const actualTime = timeSnap(testTime, snap);
      expect(actualTime.unix()).to.equal(expectedTime.unix());
    });
    it('should round to nearest hour over mid-night', function() {
      const testTime = moment('2000-01-01 23:44:40 Z', 'YYYY-MM-DD H:m:s Z');
      const expectedTime = moment('2000-01-02 00:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      const snap = 60 * 60;
      const actualTime = timeSnap(testTime, snap);
      expect(actualTime.unix()).to.equal(expectedTime.unix());
    });
    it('should round up to nearest day', function() {
      const testTime = moment('2000-01-01 12:44:40 Z', 'YYYY-MM-DD H:m:s Z');
      const expectedTime = moment('2000-01-02 00:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      const snap = 60 * 60 * 24;
      const actualTime = timeSnap(testTime, snap);
      expect(actualTime.unix()).to.equal(expectedTime.unix());
    });
    it('should round down to nearest day', function() {
      const testTime = moment('2000-01-01 11:44:40 Z', 'YYYY-MM-DD H:m:s Z');
      const expectedTime = moment('2000-01-01 00:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      const snap = 60 * 60 * 24;
      const actualTime = timeSnap(testTime, snap);
      expect(actualTime.unix()).to.equal(expectedTime.unix());
    });
  });
});
