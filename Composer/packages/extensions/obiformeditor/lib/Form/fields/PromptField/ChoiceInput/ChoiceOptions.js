// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Fragment } from 'react';
import formatMessage from 'format-message';
import get from 'lodash/get';
import { field } from '../styles';
import { TextWidget, CheckboxWidget } from '../../../widgets';
export var ChoiceOptions = function(props) {
  var schema = props.schema,
    formData = props.formData,
    onChange = props.onChange,
    idSchema = props.idSchema,
    formContext = props.formContext;
  var optionSchema = function(field) {
    return get(schema, ['properties', field]);
  };
  return jsx(
    Fragment,
    null,
    jsx(
      'div',
      { css: field },
      jsx(TextWidget, {
        onChange: onChange('inlineSeparator'),
        schema: optionSchema('inlineSeparator'),
        id: idSchema.inlineSeparator && idSchema.inlineSeparator.__id,
        value: formData.inlineSeparator,
        label: formatMessage('Inline separator'),
        formContext: formContext,
      })
    ),
    jsx(
      'div',
      { css: field },
      jsx(TextWidget, {
        onChange: onChange('inlineOr'),
        schema: optionSchema('inlineOr'),
        id: idSchema.inlineOr && idSchema.inlineOr.__id,
        value: formData.inlineOr,
        label: formatMessage('Inline or'),
        formContext: formContext,
      })
    ),
    jsx(
      'div',
      { css: field },
      jsx(TextWidget, {
        onChange: onChange('inlineOrMore'),
        schema: optionSchema('inlineOrMore'),
        id: idSchema.inlineOrMore && idSchema.inlineOrMore.__id,
        value: formData.inlineOrMore,
        label: formatMessage('Inline or more'),
        formContext: formContext,
      })
    ),
    jsx(
      'div',
      { css: field },
      jsx(CheckboxWidget, {
        onChange: onChange('includeNumbers'),
        schema: optionSchema('includeNumbers'),
        id: idSchema.includeNumbers && idSchema.includeNumbers.__id,
        value: formData.includeNumbers,
        label: formatMessage('Include numbers'),
        formContext: formContext,
      })
    )
  );
};
//# sourceMappingURL=ChoiceOptions.js.map
