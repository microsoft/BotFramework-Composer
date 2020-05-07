// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { ExpressionWidget } from '../../../widgets/ExpressionWidget';
export var DynamicChoices = function(props) {
  var id = props.id,
    formContext = props.formContext,
    _a = props.formData,
    formData = _a === void 0 ? '' : _a,
    onChange = props.onChange,
    schema = props.schema,
    description = props.schema.description;
  return jsx(ExpressionWidget, {
    id: id,
    label: formatMessage('Choice'),
    formContext: formContext,
    onChange: function(_, value) {
      if (value === void 0) {
        value = '';
      }
      return onChange && onChange(value);
    },
    options: { hideLabel: true },
    placeholder: description,
    value: formData,
    schema: schema,
  });
};
//# sourceMappingURL=DynamicChoices.js.map
