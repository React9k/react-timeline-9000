import {expect} from 'chai';

import {intToPix, pixToInt} from './commonUtils';

describe('Common Utils', function() {
  describe('intToPix', function() {
    it('should convert an int to a pixel string', function() {
      expect(intToPix(1)).to.equal('1px');
    });
    it('should leave already converted strings as is', function() {
      expect(intToPix('1px')).to.equal('1px');
    });
  });
  describe('pixToInt', function() {
    it('should convert a string to an int', function() {
      expect(pixToInt('1px')).to.equal(1);
    });
    it('should convert a string to an int (2)', function() {
      expect(pixToInt('1 px')).to.equal(1);
    });
  });
});
