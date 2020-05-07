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
import React from 'react';
import formatMessage from 'format-message';
import { Choices } from './ChoiceInput/Choices';
import { ChoiceOptions } from './ChoiceInput/ChoiceOptions';
export var ConfirmInputSettings = function(props) {
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
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(Choices, {
      formContext: formContext,
      formData: formData.confirmChoices,
      schema: getSchema('confirmChoices'),
      onChange: onChange('confirmChoices'),
      id: idSchema.confirmChoices && idSchema.confirmChoices.__id,
      label: formatMessage('Confirm Options'),
    }),
    React.createElement(ChoiceOptions, {
      schema: getSchema('choiceOptions'),
      idSchema: idSchema.choiceOptions,
      onChange: updateChoiceOptions,
      formData: formData.choiceOptions || {},
      formContext: formContext,
    })
  );
};
//# sourceMappingURL=ConfirmInput.js.map
