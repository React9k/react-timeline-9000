'use strict';
import {expect} from 'chai';

import texter from './'


describe('#texter', function() {
    it('should return the same text', function() {
        let result = texter("Hi")
        expect(result).to.equal("Hi");
    });
});