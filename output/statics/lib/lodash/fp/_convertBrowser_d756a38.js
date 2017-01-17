var baseConvert = require('lib/lodash/fp/_baseConvert');

/**
 * Converts `lodash` to an immutable auto-curried iteratee-first data-last
 * version with conversion `options` applied.
 *
 * @param {Function} lodash The lodash function to convert.
 * @param {Object} [options] The options object. See `baseConvert` for more details.
 * @returns {Function} Returns the converted `lodash`.
 */
function browserConvert(lodash, options) {
  return baseConvert(lodash, lodash, options);
}

if (typeof _ == 'function') {
  _ = browserConvert(_.runInContext());
}
module.exports = browserConvert;
