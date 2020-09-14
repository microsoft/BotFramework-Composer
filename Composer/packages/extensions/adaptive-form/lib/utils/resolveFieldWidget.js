'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.resolveFieldWidget = void 0;
var tslib_1 = require('tslib');
var DefaultFields = tslib_1.__importStar(require('../components/fields'));
/**
 * Resolves field widget in this order:
 *   UISchema field override, schema.$role, schema.$kind, schema.type
 * @param schema
 * @param uiOptions
 */
function resolveFieldWidget(schema, uiOptions, globalUIOptions) {
  var _a, _b;
  var FieldOverride = uiOptions === null || uiOptions === void 0 ? void 0 : uiOptions.field;
  if (typeof FieldOverride === 'function') {
    return FieldOverride;
  }
  if (schema) {
    if (schema.$role) {
      switch (schema.$role) {
        case 'expression':
          return DefaultFields.ExpressionField;
      }
    }
    if (globalUIOptions) {
      var KindOverride =
        schema.$kind && ((_a = globalUIOptions[schema.$kind]) === null || _a === void 0 ? void 0 : _a.field);
      if (KindOverride) {
        return KindOverride;
      }
    }
    if ((schema.oneOf && Array.isArray(schema.oneOf)) || Array.isArray(schema.type)) {
      return DefaultFields.OneOfField;
    }
    if (Array.isArray(schema.enum)) {
      return DefaultFields.SelectField;
    }
    if (
      (_b = uiOptions === null || uiOptions === void 0 ? void 0 : uiOptions.intellisenseScopes) === null ||
      _b === void 0
        ? void 0
        : _b.length
    ) {
      return DefaultFields.IntellisenseField;
    }
    switch (schema.type) {
      case undefined:
      case 'string':
        return DefaultFields.StringField;
      case 'integer':
      case 'number':
        return DefaultFields.NumberField;
      case 'boolean':
        return DefaultFields.BooleanField;
      case 'array': {
        var items = schema.items;
        if (Array.isArray(items) && typeof items[0] === 'object' && items[0].type === 'object') {
          return DefaultFields.ObjectArrayField;
        } else if (!Array.isArray(items) && typeof items === 'object' && items.type === 'object') {
          return DefaultFields.ObjectArrayField;
        }
        return DefaultFields.ArrayField;
      }
      case 'object':
        return schema.additionalProperties ? DefaultFields.OpenObjectField : DefaultFields.ObjectField;
    }
  }
  return DefaultFields.UnsupportedField;
}
exports.resolveFieldWidget = resolveFieldWidget;
//# sourceMappingURL=resolveFieldWidget.js.map
