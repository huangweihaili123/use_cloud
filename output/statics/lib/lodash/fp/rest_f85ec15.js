var convert = require('lib/lodash/fp/convert'),
    func = convert('rest', require('lib/lodash/rest'));

func.placeholder = require('lib/lodash/fp/placeholder');
module.exports = func;
