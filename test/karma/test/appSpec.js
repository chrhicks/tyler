/*global define*/
/*global describe, it, expect*/

define(['tyler'], function(tyler) {
  'use strict';
  describe('just checking', function() {
    it('has a isValid function', function () {
      expect(typeof tyler.isValid).toBe('function');
    });

    it('has an isBalanced function', function () {
      expect(typeof tyler.isBalanced).toBe('function');
    });

    it('has an injectElement function', function () {
      expect(typeof tyler.injectElement).toBe('function');
    });

    it('has a createLayout function', function() {
      expect(typeof tyler.createLayout).toBe('function');
    });
  });
});
