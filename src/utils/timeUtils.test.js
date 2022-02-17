import {expect} from 'chai';

import moment from 'moment';
import {
  timeSnap,
  getTimeAtPixel,
  getPixelAtTime,
  getDurationFromPixels,
  getSnapPixelFromDelta,
  convertDateToMoment,
  convertMomentToDateType
} from './timeUtils';

describe('Time Utils', function() {
  describe('timeSnap', function() {
    it('should round up to the last sec', function() {
      const testTime = moment('2000-01-01 10:00:00.872 Z', 'YYYY-MM-DD H:m:s.SSS Z');
      const expectedTime = moment('2000-01-01 10:00:00.000 Z', 'YYYY-MM-DD H:m:s.SSS Z');
      const snap = 1000;
      const actualTime = timeSnap(testTime, snap);
      expect(actualTime.unix()).to.equal(expectedTime.unix());
    });
    it('should round down to the last sec', function() {
      const testTime = moment('2000-01-01 10:00:00.272 Z', 'YYYY-MM-DD H:m:s.SSS Z');
      const expectedTime = moment('2000-01-01 10:00:00.000 Z', 'YYYY-MM-DD H:m:s.SSS Z');
      const snap = 1000;
      const actualTime = timeSnap(testTime, snap);
      expect(actualTime.unix()).to.equal(expectedTime.unix());
    });
    it('should round up to the nearest min', function() {
      const testTime = moment('2000-01-01 9:59:50 Z', 'YYYY-MM-DD H:m:s Z');
      const expectedTime = moment('2000-01-01 10:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      const snap = 60 * 1000;
      const actualTime = timeSnap(testTime, snap);
      expect(actualTime.unix()).to.equal(expectedTime.unix());
    });
    it('should round down to the nearest min', function() {
      const testTime = moment('2000-01-01 10:00:20 Z', 'YYYY-MM-DD H:m:s Z');
      const expectedTime = moment('2000-01-01 10:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      const snap = 60 * 1000;
      const actualTime = timeSnap(testTime, snap);
      expect(actualTime.unix()).to.equal(expectedTime.unix());
    });
    it('should round up when at 30s (nearest min)', function() {
      const testTime = moment('2000-01-01 10:00:30 Z', 'YYYY-MM-DD H:m:s Z');
      const expectedTime = moment('2000-01-01 10:01:00 Z', 'YYYY-MM-DD H:m:s Z');
      const snap = 60 * 1000;
      const actualTime = timeSnap(testTime, snap);
      expect(actualTime.unix()).to.equal(expectedTime.unix());
    });
    it('should round to nearest hour', function() {
      const testTime = moment('2000-01-01 10:12:30 Z', 'YYYY-MM-DD H:m:s Z');
      const expectedTime = moment('2000-01-01 10:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      const snap = 60 * 60 * 1000;
      const actualTime = timeSnap(testTime, snap);
      expect(actualTime.unix()).to.equal(expectedTime.unix());
    });
    it('should round to nearest hour over mid-night', function() {
      const testTime = moment('2000-01-01 23:44:40 Z', 'YYYY-MM-DD H:m:s Z');
      const expectedTime = moment('2000-01-02 00:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      const snap = 60 * 60 * 1000;
      const actualTime = timeSnap(testTime, snap);
      expect(actualTime.unix()).to.equal(expectedTime.unix());
    });
    it('should round up to nearest day', function() {
      const testTime = moment('2000-01-01 12:44:40 Z', 'YYYY-MM-DD H:m:s Z');
      const expectedTime = moment('2000-01-02 00:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      const snap = 60 * 60 * 24 * 1000;
      const actualTime = timeSnap(testTime, snap);
      expect(actualTime.unix()).to.equal(expectedTime.unix());
    });
    it('should round down to nearest day', function() {
      const testTime = moment('2000-01-01 11:44:40 Z', 'YYYY-MM-DD H:m:s Z');
      const expectedTime = moment('2000-01-01 00:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      const snap = 60 * 60 * 24 * 1000;
      const actualTime = timeSnap(testTime, snap);
      expect(actualTime.unix()).to.equal(expectedTime.unix());
    });
  });
  describe('getTimeAtPixel', function() {
    it('should return start time for 0', function() {
      const visStart = moment('2000-01-01 00:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      const visEnd = moment('2000-01-08 00:00:00 Z', 'YYYY-MM-DD H:m:s Z'); // 7 days
      const timelineWidth = 2000; //2000 px
      const pixelOffset = 0;
      let time = getTimeAtPixel(pixelOffset, visStart, visEnd, timelineWidth);
      expect(time.unix()).to.equal(visStart.unix());
    });
    it('should return before start for -ve pixels', function() {
      const visStart = moment('2000-01-01 00:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      const visEnd = moment('2000-01-08 00:00:00 Z', 'YYYY-MM-DD H:m:s Z'); // 7 days
      const timelineWidth = 2000; //2000 px
      const pixelOffset = -40;
      let time = getTimeAtPixel(pixelOffset, visStart, visEnd, timelineWidth);
      expect(time.unix()).to.lt(visStart.unix());
    });
    it('should return end time for width pixels', function() {
      const visStart = moment('2000-01-01 00:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      const visEnd = moment('2000-01-08 00:00:00 Z', 'YYYY-MM-DD H:m:s Z'); // 7 days
      const timelineWidth = 2000; //2000 px
      const pixelOffset = 2000;
      let time = getTimeAtPixel(pixelOffset, visStart, visEnd, timelineWidth);
      expect(time.unix()).to.equal(visEnd.unix());
    });
    it('should return higher than width for over width pixels', function() {
      const visStart = moment('2000-01-01 00:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      const visEnd = moment('2000-01-08 00:00:00 Z', 'YYYY-MM-DD H:m:s Z'); // 7 days
      const timelineWidth = 2000; //2000 px
      const pixelOffset = 2400;
      let time = getTimeAtPixel(pixelOffset, visStart, visEnd, timelineWidth);
      expect(time.unix()).to.gt(visEnd.unix());
    });
    it('should return correct fraction of time for given pixel location', function() {
      const visStart = moment('2000-01-01 00:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      const visEnd = moment('2000-01-08 00:00:00 Z', 'YYYY-MM-DD H:m:s Z'); // 7 days
      const timelineWidth = 2100; //2000 px
      const pixelOffset = 300;
      const expectedTime = visStart.clone().add((pixelOffset / timelineWidth) * 7, 'days');
      let time = getTimeAtPixel(pixelOffset, visStart, visEnd, timelineWidth);
      expect(time.unix()).to.equal(expectedTime.unix());
    });
  });
  describe('getPixelAtTime', function() {
    it('should return 0 for start time', function() {
      const visStart = moment('2000-01-01 00:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      const visEnd = moment('2000-01-08 00:00:00 Z', 'YYYY-MM-DD H:m:s Z'); // 7 days
      const timelineWidth = 2000; //2000 px
      const testTime = visStart.clone();
      let pixels = getPixelAtTime(testTime, visStart, visEnd, timelineWidth);
      expect(pixels).to.equal(0);
    });
    it('should return -ve for before start time', function() {
      const visStart = moment('2000-01-01 00:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      const visEnd = moment('2000-01-08 00:00:00 Z', 'YYYY-MM-DD H:m:s Z'); // 7 days
      const timelineWidth = 2000; //2000 px
      const testTime = moment('1999-12-30 00:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      let pixels = getPixelAtTime(testTime, visStart, visEnd, timelineWidth);
      expect(pixels).to.lt(0);
    });
    it('should return width for end time', function() {
      const visStart = moment('2000-01-01 00:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      const visEnd = moment('2000-01-08 00:00:00 Z', 'YYYY-MM-DD H:m:s Z'); // 7 days
      const timelineWidth = 2000; //2000 px
      const testTime = visEnd.clone();
      let pixels = getPixelAtTime(testTime, visStart, visEnd, timelineWidth);
      expect(pixels).to.equal(timelineWidth);
    });
    it('should return greater than width for after end time', function() {
      const visStart = moment('2000-01-01 00:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      const visEnd = moment('2000-01-08 00:00:00 Z', 'YYYY-MM-DD H:m:s Z'); // 7 days
      const timelineWidth = 2000; //2000 px
      const testTime = moment('2000-01-09 00:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      let pixels = getPixelAtTime(testTime, visStart, visEnd, timelineWidth);
      expect(pixels).to.gt(timelineWidth);
    });
    it('should return correct pixels for given fraction of time', function() {
      const visStart = moment('2000-01-01 00:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      const visEnd = moment('2000-01-08 00:00:00 Z', 'YYYY-MM-DD H:m:s Z'); // 7 days
      const timelineWidth = 2000; //2000 px
      const testTime = moment('2000-01-04 12:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      const expectedPixels = timelineWidth * (3.5 / 7);
      let pixels = getPixelAtTime(testTime, visStart, visEnd, timelineWidth);
      expect(pixels).to.equal(expectedPixels);
    });
  });
  describe('getDurationFromPixels', function() {
    it('should return 0 for 0 pixels', function() {
      const visStart = moment('2000-01-01 00:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      const visEnd = moment('2000-01-08 00:00:00 Z', 'YYYY-MM-DD H:m:s Z'); // 7 days
      const timelineWidth = 2000; //2000 px
      const pixelOffset = 0;
      let duration = getDurationFromPixels(pixelOffset, visStart, visEnd, timelineWidth);
      expect(duration.asSeconds()).to.equal(0);
    });
    it('should return negative duration for -ve pixels', function() {
      const visStart = moment('2000-01-01 00:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      const visEnd = moment('2000-01-08 00:00:00 Z', 'YYYY-MM-DD H:m:s Z'); // 7 days
      const timelineWidth = 2000; //2000 px
      const pixelOffset = -40;
      let duration = getDurationFromPixels(pixelOffset, visStart, visEnd, timelineWidth);
      expect(duration.asSeconds()).to.lt(0);
    });
    it('should return (visible end - visible start) for width pixels', function() {
      const visStart = moment('2000-01-01 00:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      const visEnd = moment('2000-01-08 00:00:00 Z', 'YYYY-MM-DD H:m:s Z'); // 7 days
      const timelineWidth = 2000; //2000 px
      const pixelOffset = 2000;
      const expectedDuration = visEnd.diff(visStart, 'seconds');
      let duration = getDurationFromPixels(pixelOffset, visStart, visEnd, timelineWidth);
      expect(duration.asSeconds()).to.equal(expectedDuration);
    });
    it('should return higher than (visible end - visible start) for over width pixels', function() {
      const visStart = moment('2000-01-01 00:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      const visEnd = moment('2000-01-08 00:00:00 Z', 'YYYY-MM-DD H:m:s Z'); // 7 days
      const timelineWidth = 2000; //2000 px
      const pixelOffset = 2400;
      let duration = getDurationFromPixels(pixelOffset, visStart, visEnd, timelineWidth);
      expect(duration.asSeconds()).to.gt(moment.duration(7, 'days').asSeconds());
    });
    it('should return correct fraction of duration for given pixel location', function() {
      const visStart = moment('2000-01-01 00:00:00 Z', 'YYYY-MM-DD H:m:s Z');
      const visEnd = moment('2000-01-08 00:00:00 Z', 'YYYY-MM-DD H:m:s Z'); // 7 days
      const timelineWidth = 2100; //2000 px
      const pixelOffset = 300;
      const expectedDuration = (pixelOffset / timelineWidth) * 7 * 24 * 60 * 60;
      let duration = getDurationFromPixels(pixelOffset, visStart, visEnd, timelineWidth);
      expect(duration.asSeconds()).to.equal(expectedDuration);
    });
  }),
    describe('convertDateToMoment', function() {
      it('should return the received date(moment) when useMoment is true', function() {
        const date = moment('2000-01-01 00:00:00 Z', 'YYYY-MM-DD H:m:s Z');
        const useMoment = true;
        let expectedMoment = date;
        let actualMoment = convertDateToMoment(date, useMoment);
        expect(actualMoment).to.deep.equal(expectedMoment);
      });
      it('should convert date to moment when useMoment is false', function() {
        const date = moment('2000-01-01 00:00:00 Z', 'YYYY-MM-DD H:m:s Z').valueOf();
        const useMoment = false;
        let expectedMoment = moment(date);
        let actualMoment = convertDateToMoment(date, useMoment);
        expect(actualMoment).to.deep.equal(expectedMoment);
      });
    }),
    describe('convertMomentToDateType', function() {
      it('should return moment when useMoment is true', function() {
        const date = moment('2000-01-01 00:00:00 Z', 'YYYY-MM-DD H:m:s Z');
        const useMoment = true;
        let expectedMoment = date;
        let actualMoment = convertMomentToDateType(date, useMoment);
        expect(actualMoment).to.deep.equal(expectedMoment);
      });
      it('should return date in millis when useMoment is false', function() {
        const date = moment('2000-01-01 00:00:00 Z', 'YYYY-MM-DD H:m:s Z');
        const useMoment = false;
        let expectedDate = 946684800000;
        let actualDate = convertMomentToDateType(date, useMoment);
        expect(actualDate).to.deep.equal(expectedDate);
      });
    });
});
