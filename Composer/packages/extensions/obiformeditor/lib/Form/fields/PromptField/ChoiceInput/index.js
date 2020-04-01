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
import { Fragment } from 'react';
import formatMessage from 'format-message';
import { CheckboxWidget } from '../../../widgets';
import { field } from '../styles';
import { Choices } from './Choices';
import { ChoiceOptions } from './ChoiceOptions';
export var ChoiceInputSettings = function(props) {
  var getSchema = props.getSchema,
    formData = props.formData,
    idSchema = props.idSchema,
    onChange = props.onChange,
    formContext = props.formContext;
  var updateChoiceOptions = function(field) {
    return function(data) {
      var _a;
      var updater = onChange('choiceOptions');
      updater(__assign(__assign({}, formData.choiceOptions), ((_a = {}), (_a[field] = data), _a)));
    };
  };
  return jsx(
    Fragment,
    null,
    jsx(Choices, {
      formContext: formContext,
      formData: formData.choices,
      schema: getSchema('choices'),
      onChange: onChange('choices'),
      id: idSchema.choices && idSchema.choices.__id,
      label: formatMessage('Choice Options'),
    }),
    jsx(ChoiceOptions, {
      schema: getSchema('choiceOptions'),
      idSchema: idSchema.choiceOptions,
      onChange: updateChoiceOptions,
      formData: formData.choiceOptions || {},
      formContext: formContext,
    }),
    jsx(
      'div',
      { css: field },
      jsx(CheckboxWidget, {
        onChange: onChange('appendChoices'),
        schema: getSchema('appendChoices'),
        id: idSchema.appendChoices && idSchema.appendChoices.__id,
        value: formData.appendChoices,
        label: formatMessage('Append choices'),
        formContext: formContext,
      })
    )
  );
};
//# sourceMappingURL=index.js.map
