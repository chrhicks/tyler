/*global define, module, require*/

/**
 *    Tyler
 *    https://github.com/chrhicks/tyler
 *
 *     @Chicks, fill out whatever description you want up here with copyright
 *     and whatever. You can look at
 *     https://github.com/nathanstilwell/SocketWrench/blob/7e962d7a98a6b696e52a8dbd6cee75ac0a42d705/lib/socketwrench.js#L9
 *     as an example if you like.
 */

/*
  Module Definition pattern from UMD
  https://github.com/umdjs/umd
*/

(function (root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['underscore'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // only CommonJS-like environments that support module.exports,
    // like Node and Browserify
    var _ = require('lodash');
    module.exports = factory(_);
  } else {
    // Browser globals (root is window)
    root.tyler = factory(root._);
  }
}(this, function (_) {

  'use strict';

  /**
   * Generates a map of valid positions for elements of each type.
   * If there are three columns in the layout, then it'll make a map
   * for the allowed positions for spans of 1, 2 and 3.
   *
   * NOTE: The moment you add a new element to the layout, the drop
   * target map needs to be re-generated!
   *
   * @param  {[Object]} - the elements already placed in the layout
   * @param  {Number} - The maximum number of positions you want to
   *                    create targets for
   * @return {Object} - map of valid drop targets for each span
   */
  function generateValidPositions (positionedElements, maxPositions) {
    var maxColumns = 3;
    var result = {
        1: [],
        2: [],
        3: []
      };
    var existingPositions = _.map(positionedElements, function (e) { return e.position; });
    var isValidOpts = {
        maxColumns: maxColumns,
        maxPositions: maxPositions
      };

    // console.log('existingPositions', existingPositions);

    _.forEach(_.range(1, 4), function (span) {
      // console.log('Generating targets for span: ' + span);
      for(var position = 0; position < maxPositions; position++) {
        if (_.includes(existingPositions, position)) {
          // console.log('skipping position ' + position + '. Already held by an element');
        } else {
          var newElement = { position: position, columns: span };
          var isValidForPosition = isValid(newElement, positionedElements, isValidOpts);
          // console.log('position:', position, 'isValid', isValidForPosition);
          if (isValidForPosition) {
            result[span].push(position);
          }
        }
      }
    });

    return result;
  }

  /**
   * Checks if adding a new element to existing elements will result
   * in a balanced layout across all columns from 2..maxColumns.
   *
   * And element is defined as:
   * {
   *    position: [Number],
   *    columns:  [Number]
   * }
   *
   * @param  {Object}
   * @param  {[Object]}
   * @param  {[Number]}
   * @return {Boolean}
   */
  function isValid (newElement, existingElements, opts) {
    // console.log('isValid', newElement, existingElements, opts);
    var placedElementSpans = injectElement(newElement, existingElements);
    var columnRange = _.range(2, opts.maxColumns + 1);

    // console.log('placedElementSpans', placedElementSpans);
    // console.log('columnRange', columnRange);

    var results = _.map(columnRange, function (col) {
      var layout = createLayout(placedElementSpans, col, opts);
      // console.log('layout', layout);
      var isBalancedLayout = isBalanced(layout, col);
      // console.log('Column ' + col + ' balanced: ' + isBalancedLayout);
      return isBalancedLayout;
    });

    // console.log('results', results);
    // console.log('every true?', _.every(results));
    return _.every(results);
  }

  /**
   * Creates a layout, represented as a list of span values.
   *
   * Aka, if elements looks like:
   * [
   *    { position: 1, columns: 2 },
   *    { position: 5, columns: 2 },
   *    { position: 10, columns: 3 }
   * ];
   *
   * You should expect a result that looks like:
   *
   * [1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 3]
   *
   * Assumptions:
   * - an element with a span > cols will be responsive and work when
   *   span === cols. So if an element has a span of '3', it will be placed
   *   in the layout as '2' if the cols param is 2.
   * - an element's position is zero indexed
   * - the max position is the last element, which should be sufficient
   *    as far as rendering is concerned
   * - the smallest span is 1
   *
   * @param  {[Object]}
   * @param  {Number}
   * @return {[Number]}
   */
  function createLayout (elements, cols, opts) {
    var maxPosition = _.max(_.map(elements, function (e) { return e.position; }));
    var result = new Array(_.max([maxPosition, opts.maxPositions]));

    result = _.map(result, function () { return 1; });

    _.forEach(elements, function (e) {
      result[e.position] = e.columns > cols ? cols : e.columns;
    });

    return result;
  }

  /**
   * Abstractly layout the provided elements according to their position
   * properties.
   *
   * @param  {[type]} elements List of element objects with at minimum the position and columns property
   * @param  {[type]} opts     Options for this function:
   *                           - maxPositions - the size of the resulting layout (usually the total number of elements in your grid)
   * @return {[type]}          List of elements in the correct position of the resulting array, backfilled with blank elements
   */
  function layoutElements (elements, opts) {
    var maxPosition = _.max(_.map(elements, function (e) { return e.position; }));
    var result = new Array(_.max([maxPosition, opts.maxPositions]));

    result = _.map(result, function () { return { columns: 1 }; });

    _.forEach(elements, function (e) {
      result[e.position] = e;
    });

    result = _.forEach(result, function (e, idx) {
      var elem = result[idx];

      if (!elem.position) {
        result[idx].position = idx;
      }
    });

    return result;
  }

  /**
   * Returns a new list of elements with newElement added to existingElements.
   *
   * Checks to make sure that there is no collision with existing elements' positions.
   *
   * @param  {Object}
   * @param  {[Object]}
   * @return {[Object]}
   */
  function injectElement (newElement, existingElements) {
    var clonedExistingElements = _.clone(existingElements);
    var existingPositions = _.map(_.clone(clonedExistingElements), function (e) { return e.position; });
    var newPosition = newElement.position;

    if (_.includes(existingPositions, newPosition)) {
      throw new Error('There is already an element at position ' + newElement.position);
    }

    clonedExistingElements.push(newElement);

    return clonedExistingElements;
  }

  /**
   * Checks if the given list of elements will render correctly for the
   * provided number of columns.
   *
   * @param  {[Number]} - a layout represented as an array of span values
   * @param  {Number} - the number of columns to check the layout against
   * @return {Boolean} - whether the layout works or not
   */
  function isBalanced (elementSpans, numColumns) {
    var length = elementSpans.length;
    var totalSpansForRow = 0;
    // zero indexed column
    var column = 0;

    for (var position = 0; position < length; position++) {
      totalSpansForRow += elementSpans[position];

      // console.log('position: ' + position + ', column: ' + column + ', spans: ' + totalSpansForRow);

      if (totalSpansForRow > numColumns) {
        // console.log('layout is broken at position ' + position + ', returning');
        return false;
      }

      // If we made it this far and the spans add up to 3
      // then we reset to 0. The elements are balanced so far
      if (totalSpansForRow === numColumns) {
        totalSpansForRow = 0;
        column = 0;
      } else {
        column += 1;
      }
    }

    return true;
  }

  return {
    isValid: isValid,
    isBalanced: isBalanced,
    injectElement: injectElement,
    createLayout: createLayout,
    layoutElements: layoutElements,
    generateValidPositions: generateValidPositions
  };

})); // umd