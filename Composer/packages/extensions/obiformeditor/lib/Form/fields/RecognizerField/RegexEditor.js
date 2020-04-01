// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __assign =
  (this && this.__assign) ||
  function() {
    __assign =
      Object.assign ||
      function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { toIdSchema } from '@bfcomposer/react-jsonschema-form/lib/utils';
import { regexEditorContainer } from './styles';
export default function RegexEditor(props) {
  if (!props.schema.oneOf) {
    return null;
  }
  var _a = props.registry,
    ObjectField = _a.fields.ObjectField,
    definitions = _a.definitions,
    formData = props.formData,
    idPrefix = props.idPrefix;
  var schema = props.schema.oneOf.find(function(s) {
    return typeof s === 'object' && s.title === 'Microsoft.RegexRecognizer';
  });
  var idSchema = toIdSchema(schema, props.idSchema.__id, definitions, formData, idPrefix);
  return jsx(
    'div',
    { css: regexEditorContainer },
    jsx(ObjectField, __assign({}, props, { schema: schema, idSchema: idSchema }))
  );
}
//# sourceMappingURL=RegexEditor.js.map
