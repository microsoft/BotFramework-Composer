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
import { defaultFlowSchema } from '../schema/defaultFlowSchema';
import { defaultFlowWidgets } from '../schema/defaultFlowWidgets';
export var mergePluginConfig = function () {
  var plugins = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    plugins[_i] = arguments[_i];
  }
  var externalWidgets = plugins
    .map(function (x) {
      var _a;
      return (_a = x.visualSchema) === null || _a === void 0 ? void 0 : _a.widgets;
    })
    .filter(function (x) {
      return !!x;
    });
  var externalSchema = plugins
    .map(function (x) {
      var _a;
      return (_a = x.visualSchema) === null || _a === void 0 ? void 0 : _a.schema;
    })
    .filter(function (x) {
      return !!x;
    });
  return {
    widgets: Object.assign.apply(Object, __spreadArrays([{}, defaultFlowWidgets], externalWidgets)),
    schema: Object.assign.apply(Object, __spreadArrays([{}, defaultFlowSchema], externalSchema)),
  };
};
//# sourceMappingURL=mergePluginConfig.js.map
