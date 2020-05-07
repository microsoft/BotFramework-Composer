/* eslint-disable format-message/literal-pattern */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import formatMessage from 'format-message';
import { TextWidget } from '../../widgets';
import { field, settingsFieldHalf, settingsFields, settingsFieldFull, settingsFieldValidation } from './styles';
export var TwoSettingFields = function(props) {
  var fields = props.fields,
    formData = props.formData,
    idSchema = props.idSchema,
    getSchema = props.getSchema,
    onChange = props.onChange,
    errorSchema = props.errorSchema;
  var _a = useState(),
    errorMessage = _a[0],
    setErrorMessage = _a[1];
  var onValidate = function(err) {
    setErrorMessage(err);
  };
  return jsx(
    'div',
    { css: settingsFields },
    fields.map(function(settingField, index) {
      return jsx(
        'div',
        { key: index, css: [field, settingsFieldHalf] },
        jsx(TextWidget, {
          onChange: onChange(settingField.name),
          schema: getSchema(settingField.name),
          id: idSchema[settingField.name].__id,
          value: formData[settingField.name],
          label: formatMessage(settingField.title),
          formContext: props.formContext,
          rawErrors: errorSchema[settingField.name] && errorSchema[settingField.name].__errors,
          hiddenErrMessage: true,
          onValidate: onValidate,
        })
      );
    }),
    jsx('div', { css: [field, settingsFieldFull, settingsFieldValidation] }, errorMessage)
  );
};
//# sourceMappingURL=twoSettingFields.js.map
