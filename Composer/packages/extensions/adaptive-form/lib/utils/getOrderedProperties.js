'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getOrderedProperties = void 0;
var tslib_1 = require('tslib');
var cloneDeep_1 = tslib_1.__importDefault(require('lodash/cloneDeep'));
var format_message_1 = tslib_1.__importDefault(require('format-message'));
var getHiddenProperties_1 = require('./getHiddenProperties');
function getOrderedProperties(
  schema,
  baseUiOptions,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data
) {
  var _a;
  var uiOptions = cloneDeep_1.default(baseUiOptions);
  var _b = uiOptions.order,
    order = _b === void 0 ? ['*'] : _b;
  var hiddenFieldSet = getHiddenProperties_1.getHiddenProperties(uiOptions, data);
  var uiOrder = typeof order === 'function' ? order(data) : order || [];
  var orderedFieldSet = new Set();
  var orderedFields = uiOrder.reduce(function (allFields, field) {
    var _a, _b;
    if (field === '*') {
      allFields.push(field);
      orderedFieldSet.add(field);
      return allFields;
    }
    if (Array.isArray(field)) {
      var fieldTuple = [];
      for (var _i = 0, field_1 = field; _i < field_1.length; _i++) {
        var f = field_1[_i];
        if (!hiddenFieldSet.has(f) && ((_a = schema.properties) === null || _a === void 0 ? void 0 : _a[f])) {
          orderedFieldSet.add(f);
          fieldTuple.push(f);
        }
      }
      if (fieldTuple.length === 2) {
        allFields.push(fieldTuple);
      } else {
        allFields.push.apply(allFields, fieldTuple);
      }
    } else {
      if (!hiddenFieldSet.has(field) && ((_b = schema.properties) === null || _b === void 0 ? void 0 : _b[field])) {
        orderedFieldSet.add(field);
        allFields.push(field);
      }
    }
    return allFields;
  }, []);
  var allProperties = Object.keys((_a = schema.properties) !== null && _a !== void 0 ? _a : {}).filter(function (p) {
    return !p.startsWith('$') && !hiddenFieldSet.has(p);
  });
  var restIdx = orderedFields.indexOf('*');
  // only validate wildcard if not all properties are ordered already
  if (
    allProperties.some(function (p) {
      return !orderedFieldSet.has(p);
    })
  ) {
    var errorMsg = void 0;
    if (restIdx === -1) {
      errorMsg = format_message_1.default('no wildcard');
    } else if (restIdx !== orderedFields.lastIndexOf('*')) {
      errorMsg = format_message_1.default('multiple wildcards');
    }
    if (errorMsg) {
      throw new Error(
        format_message_1.default('Error in UI schema for {title}: {errorMsg}\n{options}', {
          title: schema.title,
          errorMsg: errorMsg,
          options: JSON.stringify(uiOptions, null, 2),
        })
      );
    }
  }
  var restFields = Object.keys(schema.properties || {}).filter(function (p) {
    return !orderedFieldSet.has(p) && !p.startsWith('$');
  });
  if (restIdx === -1) {
    orderedFields.push.apply(orderedFields, restFields);
  } else {
    orderedFields.splice.apply(orderedFields, tslib_1.__spreadArrays([restIdx, 1], restFields));
  }
  return orderedFields;
}
exports.getOrderedProperties = getOrderedProperties;
//# sourceMappingURL=getOrderedProperties.js.map
