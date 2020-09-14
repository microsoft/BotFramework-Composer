// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import get from 'lodash/get';
var DesignerCache = /** @class */ (function () {
  function DesignerCache(MAX_CACHE_SIZE) {
    if (MAX_CACHE_SIZE === void 0) {
      MAX_CACHE_SIZE = 99999;
    }
    this.boundaryCache = {};
    this.cacheSize = 0;
    this.MAX_CACHE_SIZE = MAX_CACHE_SIZE;
  }
  DesignerCache.prototype.getActionDataHash = function (actionData) {
    var designerId = get(actionData, '$designer.id', '');
    if (!designerId) return null;
    var $kind = get(actionData, '$kind');
    return $kind + '-' + designerId;
  };
  DesignerCache.prototype.cacheBoundary = function (actionData, boundary) {
    var key = this.getActionDataHash(actionData);
    if (!key) {
      return false;
    }
    if (this.cacheSize >= this.MAX_CACHE_SIZE) {
      delete this.boundaryCache;
      this.boundaryCache = {};
      this.cacheSize = 0;
    }
    this.boundaryCache[key] = boundary;
    this.cacheSize += 1;
    return true;
  };
  DesignerCache.prototype.uncacheBoundary = function (actionData) {
    var key = this.getActionDataHash(actionData);
    if (!key) return false;
    return delete this.boundaryCache[key];
  };
  DesignerCache.prototype.loadBounary = function (actionData) {
    var key = this.getActionDataHash(actionData);
    if (key) {
      return this.boundaryCache[key];
    }
  };
  return DesignerCache;
})();
export { DesignerCache };
export var designerCache = new DesignerCache();
//# sourceMappingURL=DesignerCache.js.map
