var convert = require('lib/lodash/fp/convert'),
    func = convert('subtract', require('lib/lodash/subtract'));

func.placeholder = require('lib/lodash/fp/placeholder');
module.exports = func;
