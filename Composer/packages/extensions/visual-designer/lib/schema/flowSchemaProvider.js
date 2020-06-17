// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __spreadArrays =
  (this && this.__spreadArrays) ||
  function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];
    return r;
  };
import get from 'lodash/get';
var FlowSchemaProvider = /** @class */ (function () {
  function FlowSchemaProvider() {
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
  FlowSchemaProvider.prototype.mergeSchemas = function (orderedSchemas) {
    if (!Array.isArray(orderedSchemas) || !orderedSchemas.length) return {};
    return Object.assign.apply(Object, __spreadArrays([{}], orderedSchemas));
  };
  return FlowSchemaProvider;
})();
export { FlowSchemaProvider };
//# sourceMappingURL=flowSchemaProvider.js.map
