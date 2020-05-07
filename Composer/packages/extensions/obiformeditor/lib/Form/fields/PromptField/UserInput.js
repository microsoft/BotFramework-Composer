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
import { SDKTypes } from '@bfc/shared';
import { TextWidget, SelectWidget } from '../../widgets';
import { field } from './styles';
import { ChoiceInputSettings } from './ChoiceInput';
import { ConfirmInputSettings } from './ConfirmInput';
var getOptions = function(enumSchema) {
  if (!enumSchema || !enumSchema.enum || !Array.isArray(enumSchema.enum)) {
    return [];
  }
  return enumSchema.enum.map(function(o) {
    return { label: o, value: o };
  });
};
export var UserInput = function(props) {
  var onChange = props.onChange,
    getSchema = props.getSchema,
    idSchema = props.idSchema,
    formData = props.formData,
    errorSchema = props.errorSchema;
  return jsx(
    Fragment,
    null,
    jsx(
      'div',
      { css: field },
      jsx(TextWidget, {
        onChange: onChange('property'),
        schema: getSchema('property'),
        id: idSchema.property.__id,
        value: formData.property,
        label: formatMessage('Property to fill'),
        formContext: props.formContext,
        rawErrors: errorSchema.property && errorSchema.property.__errors,
      })
    ),
    getSchema('outputFormat') &&
      jsx(
        'div',
        { css: field },
        jsx(TextWidget, {
          onChange: onChange('outputFormat'),
          schema: getSchema('outputFormat'),
          id: idSchema.outputFormat.__id,
          value: formData.outputFormat,
          label: formatMessage('Output Format'),
          formContext: props.formContext,
          rawErrors: errorSchema.outputFormat && errorSchema.outputFormat.__errors,
        })
      ),
    getSchema('defaultLocale') &&
      jsx(
        'div',
        { css: field },
        jsx(TextWidget, {
          onChange: onChange('defaultLocale'),
          schema: getSchema('defaultLocale'),
          id: idSchema.defaultLocale.__id,
          value: formData.defaultLocale,
          label: formatMessage('Default locale'),
          formContext: props.formContext,
          rawErrors: errorSchema.defaultLocale && errorSchema.defaultLocale.__errors,
        })
      ),
    getSchema('style') &&
      jsx(
        'div',
        { css: field },
        jsx(SelectWidget, {
          onChange: onChange('style'),
          schema: getSchema('style'),
          id: idSchema.style.__id,
          value: formData.style,
          label: formatMessage('List style'),
          formContext: props.formContext,
          rawErrors: errorSchema.style && errorSchema.style.__errors,
          options: { enumOptions: getOptions(getSchema('style')) },
        })
      ),
    formData.$type === SDKTypes.ChoiceInput && jsx(ChoiceInputSettings, __assign({}, props, { formData: formData })),
    formData.$type === SDKTypes.ConfirmInput && jsx(ConfirmInputSettings, __assign({}, props, { formData: formData }))
  );
};
//# sourceMappingURL=UserInput.js.map
