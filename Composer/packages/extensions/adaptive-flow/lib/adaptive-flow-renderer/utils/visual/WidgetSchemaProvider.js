// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { __spreadArrays } from 'tslib';
import get from 'lodash/get';
import merge from 'lodash/merge';
var WidgetSchemaProvider = /** @class */ (function () {
  /**
   * @param schemas Schemas to be merged together. Latter ones will override former ones.
   */
  function WidgetSchemaProvider() {
    var _this = this;
    var schemas = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      schemas[_i] = arguments[_i];
    }
    this.get = function ($kind) {
      return get(_this.schema, $kind, _this.schema.default);
    };
    this.schema = this.mergeSchemas(schemas);
  }
  WidgetSchemaProvider.prototype.mergeSchemas = function (orderedSchemas) {
    if (!Array.isArray(orderedSchemas) || !orderedSchemas.length) return {};
    return merge.apply(void 0, __spreadArrays([{}], orderedSchemas));
  };
  return WidgetSchemaProvider;
})();
export { WidgetSchemaProvider };
//# sourceMappingURL=WidgetSchemaProvider.js.map
