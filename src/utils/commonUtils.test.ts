import {intToPix, pixToInt} from './commonUtils';

describe('Common Utils', function() {
  describe('intToPix', function() {
    it('should convert an int to a pixel string', function() {
      expect(intToPix(1)).toEqual('1px');
    });
  });
  describe('pixToInt', function() {
    it('should convert a string to an int', function() {
      expect(pixToInt('1px')).toEqual(1);
    });
    it('should convert a string to an int (2)', function() {
      expect(pixToInt('1 px')).toEqual(1);
    });
  });
});
