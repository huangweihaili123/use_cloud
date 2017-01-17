var listCacheClear = require('lib/lodash/_listCacheClear'),
    listCacheDelete = require('lib/lodash/_listCacheDelete'),
    listCacheGet = require('lib/lodash/_listCacheGet'),
    listCacheHas = require('lib/lodash/_listCacheHas'),
    listCacheSet = require('lib/lodash/_listCacheSet');

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

module.exports = ListCache;
