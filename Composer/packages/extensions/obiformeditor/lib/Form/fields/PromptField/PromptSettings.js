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
import formatMessage from 'format-message';
import { TextWidget, CheckboxWidget } from '../../widgets';
import { TwoSettingFields } from './twoSettingFields';
import { field, settingsFields, settingsFieldFull, settingsFieldInline } from './styles';
export var PromptSettings = function(props) {
  var formData = props.formData,
    idSchema = props.idSchema,
    getSchema = props.getSchema,
    onChange = props.onChange,
    errorSchema = props.errorSchema;
  var fields = [
    {
      name: 'maxTurnCount',
      title: formatMessage('Max turn count'),
    },
    {
      name: 'defaultValue',
      title: formatMessage('Default value'),
    },
  ];
  return jsx(
    'div',
    null,
    jsx(TwoSettingFields, __assign({ fields: fields }, props)),
    jsx(
      'div',
      { css: settingsFields },
      jsx(
        'div',
        { css: [field, settingsFieldFull] },
        jsx(TextWidget, {
          onChange: onChange('allowInterruptions'),
          schema: getSchema('allowInterruptions'),
          id: idSchema.allowInterruptions.__id,
          value: formData.allowInterruptions,
          label: formatMessage('Allow interruptions'),
          formContext: props.formContext,
          rawErrors: errorSchema.allowInterruptions && errorSchema.allowInterruptions.__errors,
        })
      ),
      jsx(
        'div',
        { css: [field, settingsFieldFull, settingsFieldInline] },
        jsx(CheckboxWidget, {
          onChange: onChange('alwaysPrompt'),
          schema: getSchema('alwaysPrompt'),
          id: idSchema.alwaysPrompt.__id,
          value: formData.alwaysPrompt,
          label: formatMessage('Always prompt'),
          formContext: props.formContext,
          rawErrors: errorSchema.alwaysPrompt && errorSchema.alwaysPrompt.__errors,
        })
      )
    )
  );
};
//# sourceMappingURL=PromptSettings.js.map
