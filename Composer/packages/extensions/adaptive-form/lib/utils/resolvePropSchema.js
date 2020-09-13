'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.resolvePropSchema = void 0;
var resolveRef_1 = require('./resolveRef');
function resolvePropSchema(schema, path, definitions) {
  var _a;
  if (definitions === void 0) {
    definitions = {};
  }
  var propSchema = (_a = schema.properties) === null || _a === void 0 ? void 0 : _a[path];
  if (!propSchema || typeof propSchema !== 'object') {
    return;
  }
  return resolveRef_1.resolveRef(propSchema, definitions);
}
exports.resolvePropSchema = resolvePropSchema;
//# sourceMappingURL=resolvePropSchema.js.map
