// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import get from 'lodash/get';
var MAX_CACHE_SIZE = 99999;
var DesignerCache = /** @class */ (function () {
  function DesignerCache() {
    this.boundaryCache = {};
    this.cacheSize = 0;
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
    if (this.cacheSize > MAX_CACHE_SIZE) {
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
