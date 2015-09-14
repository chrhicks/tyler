/*jshint globalstrict: true*/
/*global require, __dirname*/
/*global describe, it*/

'use strict';

var path = require('path');
var root = path.join(__dirname, '..');
var chai = require('chai');
var expect = chai.expect;

var tyler = require(path.join(root, 'index'));

describe('Tyler', function () {
  describe('should determine if layout is balanced', function () {
    it('should be a balanced 3 column layout (1)', function () {
      var isBalanced = tyler.isBalanced([1, 1, 1, 1, 1, 1, 1, 1, 1], 3);
      expect(isBalanced).to.be.equal(true);
    });

    it('should be a balanced 3 column layout (2)', function () {
      // each row should add up to 3 or less
      var layout = [
          3,
          1, 2,
          1, 1, 1,
          1, 1
        ];
      var isBalanced = tyler.isBalanced(layout, 3);
      expect(isBalanced).to.be.equal(true);
    });

    it('should be an unbalanced 3 column layout (1)', function () {
      // each row should add up to 3 or less
      var layout = [
          1, 2,
          1, 1, 2, // this row adds up to 4. BROKEN LAYOUT!!
          1, 1, 1,
          1
        ];
      var isBalanced = tyler.isBalanced(layout, 3);
      expect(isBalanced).to.be.equal(false);
    });

    it('should be an unbalanced 3 column layout (2)', function () {
      // each row should add up to 3 or less
      var layout = [
          1, 3, // this row adds up to 4. BROKEN LAYOUT!!
          1, 2,
          1, 1, 1,
          1, 1
        ];
      var isBalanced = tyler.isBalanced(layout, 3);
      expect(isBalanced).to.be.equal(false);
    });

    it('should be a balanced 2 column layout (1)', function () {
      // each row should add up to 2 or less
      var layout = [
        1, 1,
        1, 1,
        1, 1,
        1, 1,
        1
      ];
      var isBalanced = tyler.isBalanced(layout, 2);
      expect(isBalanced).to.be.equal(true);
    });

    it('should be a balanced 2 column layout (2)', function () {
      // each row should add up to 2 or less
      var layout = [
          2,
          1, 1,
          2,
          1, 1,
          1, 1,
          1
        ];
      var isBalanced = tyler.isBalanced(layout, 2);
      expect(isBalanced).to.be.equal(true);
    });

    it('should be an unbalanced 2 column layout (1)', function () {
      // each row should add up to 2 or less
      var layout = [
          1, 2, // this row adds up to 3. BROKEN LAYOUT!!
          1, 1,
          2,
          1, 1,
          1, 1
        ];
      var isBalanced = tyler.isBalanced(layout, 2);
      expect(isBalanced).to.be.equal(false);
    });

    it('should be an unbalanced 2 column layout (2)', function () {
      // each row should add up to 2 or less
      var layout = [
          1, 1,
          1, 2, // this row adds up to 3. BROKEN LAYOUT!!
          1, 1,
          1, 1,
          1, 1
        ];
      var isBalanced = tyler.isBalanced(layout, 2);
      expect(isBalanced).to.be.equal(false);
    });
  });

  describe('should determine if an element can be added to layout', function () {
    it('should reject a new element at existing position', function () {
      var newElement = { position: 5, columns: 2 };
      var exisitingElements = [
          { position: 1, columns: 2 },
          { position: 5, columns: 2 },
          { position: 10, columns: 3 }
        ];

      var injectFn = function () { tyler.injectElement(newElement, exisitingElements); };
      expect(injectFn).to.throw(/already an element/);
    });

    it('should add a new element at new position', function () {
      var newElement = { position: 15, columns: 2 };
      var exisitingElements = [
          { position: 1, columns: 2 },
          { position: 5, columns: 2 },
          { position: 10, columns: 3 }
        ];

      var injected = tyler.injectElement(newElement, exisitingElements);
      exisitingElements.push(newElement);

      expect(injected).to.deep.equal(exisitingElements);
    });
  });

  describe('should create a layout for elements', function () {
    it('should layout spans for elements', function () {
      var elements = [
          { position: 1, columns: 2 },
          { position: 5, columns: 2 },
          { position: 10, columns: 3 }
        ];
      var opts = {
          maxPositions: 11
        };
      var result = tyler.createLayout(elements, 3, opts);
      var expected = [1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 3];
      expect(result).to.deep.equal(expected);
    });
  });

  describe('should determine if new element is valid in existing layout', function () {
    it('should be a valid new element', function () {
      /*
        Layout:
          1, 1, 1
          1, 2,
          1, 1, 1
          1, 1, 1
          [2], 1,     // This double is added at position 11
          1, 1, 1
       */
      var newElement = { position: 11, columns: 2 };
      var exisitingElements = [
          { position: 4, columns: 2 }
        ];
      var opts = {
        maxColumns: 3,
        maxPositions: 15
      };

      var isValid = tyler.isValid(newElement, exisitingElements, opts);
      expect(isValid).to.be.equal(true);
    });

    it('should be a valid new element at end of layout with 3 columns', function () {
      /*
         3 Column Layout:
          3
          1, 1, 1
          1, 2,
          1, 1, 1
          1, 1, 1
          [2]   // This double is added at position 12

         2 Column Layout:
          2,
          1, 1,
          1, 1,
          2,
          1, 1,
          1, 1,
          1, 1,
          [2]   // This double is added at position 12
       */
      var newElement = { position: 12, columns: 2 };
      var exisitingElements = [
          { position: 0, columns: 3 },
          { position: 5, columns: 2 }
        ];
      var opts = {
        maxColumns: 3,
        maxPositions: 15
      };

      var isValid = tyler.isValid(newElement, exisitingElements, opts);
      expect(isValid).to.be.equal(true);
    });

    it('should be an invalid new element', function () {
      /*
        Layout:
          1, 2,
          1, 1, 1
          1, 1, 1
          [2], 1,     // This double is added at position 8
          1, 1, 1
       */
      var newElement = { position: 8, columns: 2 };
      var exisitingElements = [
          { position: 1, columns: 2 }
        ];
      var opts = {
        maxColumns: 3,
        maxPositions: 15
      };

      var isValid = tyler.isValid(newElement, exisitingElements, opts);
      expect(isValid).to.be.equal(false);
    });

    it('should be a valid new element at end of layout', function () {
      /*
         3 Column Layout:
          3
          1, 1, 1
          1, 2,
          1, 1, 1
          1, 1, 1
          1, [2]   // This double is added at position 13

         2 Column Layout:
          2,
          1, 1,
          1, 1,
          2,
          1, 1,
          1, 1,
          1, 1,
          1, [2]   // This double is added at position 13
       */
      var newElement = { position: 13, columns: 2 };
      var exisitingElements = [
          { position: 0, columns: 3 },
          { position: 5, columns: 2 }
        ];
      var opts = {
        maxColumns: 3,
        maxPositions: 15
      };

      var isValid = tyler.isValid(newElement, exisitingElements, opts);
      expect(isValid).to.be.equal(false);
    });

    it('should fail to layout span of 3', function () {
      /*
          2, 3
          1, 1, 1
          2, 1,
          1, 1, 1,
          1, 1, 1,
          1
       */
      var newElement = { position: 1, columns: 3 };
      var exisitingElements = [
          { position: 0, columns: 2 },
          { position: 5, columns: 2 }
        ];
      var opts = {
        maxColumns: 3,
        maxPositions: 15
      };

      var isValid = tyler.isValid(newElement, exisitingElements, opts);
      expect(isValid).to.be.equal(false);
    });
  });

  describe('valid positions', function () {
    it('should generate a map from empty layout', function () {
      var exisitingElements = [];
      var result = tyler.generateValidPositions(exisitingElements, 15);
      var expected = {
        1 : [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 ],
        2 : [ 0, 4, 6, 10, 12 ],
        3 : [ 0, 6, 12 ] };

      expect(result).to.deep.equal(expected);
    });

    it('should generate a map from existing layout', function () {
      var exisitingElements = [
          { position: 0, columns: 2 },
          { position: 5, columns: 2 }
        ];

      var result = tyler.generateValidPositions(exisitingElements, 15);
      var expected = {
          1: [ 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14 ],
          2: [ 8, 10, 14 ],
          3: [ 10 ]
        };

      expect(result).to.deep.equal(expected);
    });
  });

  describe('layout elements', function () {
    it('should layout elements', function () {
      var newElement = { position: 1, columns: 3, modelType: 'editorial' };
      var exisitingElements = [
          { position: 0, columns: 2, modelType: 'editorial' },
          { position: 5, columns: 2, modelType: 'editorial' }
        ];
      var opts = {
        maxPositions: 15
      };

      var injected = tyler.injectElement(newElement, exisitingElements);
      var result = tyler.layoutElements(injected, opts);
      var expected = [
        { position: 0, columns: 2, modelType: 'editorial' },
        { position: 1, columns: 3, modelType: 'editorial' },
        { position: 2, columns: 1 },
        { position: 3, columns: 1 },
        { position: 4, columns: 1 },
        { position: 5, columns: 2, modelType: 'editorial' },
        { position: 6, columns: 1 },
        { position: 7, columns: 1 },
        { position: 8, columns: 1 },
        { position: 9, columns: 1 },
        { position: 10, columns: 1 },
        { position: 11, columns: 1 },
        { position: 12, columns: 1 },
        { position: 13, columns: 1 },
        { position: 14, columns: 1 }
      ];

      expect(result).to.deep.equal(expected);

    });
  });

});
