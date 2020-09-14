'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.resolveRef = void 0;
var tslib_1 = require('tslib');
var format_message_1 = tslib_1.__importDefault(require('format-message'));
function resolveRef(schema, definitions) {
  var _a;
  if (schema === void 0) {
    schema = {};
  }
  if (definitions === void 0) {
    definitions = {};
  }
  if (typeof (schema === null || schema === void 0 ? void 0 : schema.$ref) === 'string') {
    if (
      !((_a = schema === null || schema === void 0 ? void 0 : schema.$ref) === null || _a === void 0
        ? void 0
        : _a.startsWith('#/definitions/'))
    ) {
      return schema;
    }
    var defName = schema.$ref.replace('#/definitions/', '');
    var defSchema = definitions === null || definitions === void 0 ? void 0 : definitions[defName];
    if (!defSchema || typeof defSchema !== 'object') {
      throw new Error(format_message_1.default('Missing definition for {defName}', { defName: defName }));
    }
    var resolvedSchema = tslib_1.__assign(tslib_1.__assign({}, defSchema), schema);
    delete resolvedSchema.$ref;
    return resolvedSchema;
  } else if (typeof schema.additionalProperties === 'object' && typeof schema.additionalProperties.$ref === 'string') {
    var additionalProperties = resolveRef(schema.additionalProperties, definitions);
    var resolvedSchema = tslib_1.__assign(tslib_1.__assign({}, schema), { additionalProperties: additionalProperties });
    return resolvedSchema;
  } else if (
    typeof schema.items === 'object' &&
    !Array.isArray(schema.items) &&
    typeof schema.items.$ref === 'string'
  ) {
    var _b = schema.items,
      $ref = _b.$ref,
      rest = tslib_1.__rest(_b, ['$ref']);
    var items = resolveRef(schema.items, definitions);
    var resolvedSchema = tslib_1.__assign(tslib_1.__assign({}, schema), {
      items: tslib_1.__assign(tslib_1.__assign({}, items), rest),
    });
    return resolvedSchema;
  }
  return schema;
}
exports.resolveRef = resolveRef;
//# sourceMappingURL=resolveRef.js.map
