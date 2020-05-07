// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import formatMessage from 'format-message';
import { WidgetLabel } from '../../widgets/WidgetLabel';
import { LgEditorWidget } from '../../widgets/LgEditorWidget';
import { TextWidget } from '../../widgets';
import { Validations } from './Validations';
import { field } from './styles';
export var Other = function(props) {
  var onChange = props.onChange,
    getSchema = props.getSchema,
    idSchema = props.idSchema,
    formData = props.formData,
    errorSchema = props.errorSchema;
  return jsx(
    React.Fragment,
    null,
    jsx(
      'div',
      { css: field },
      jsx(WidgetLabel, {
        label: formatMessage('Unrecognized Prompt'),
        description: getSchema('unrecognizedPrompt').description,
      }),
      jsx(LgEditorWidget, {
        name: 'unrecognizedPrompt',
        onChange: onChange('unrecognizedPrompt'),
        value: formData.unrecognizedPrompt,
        formContext: props.formContext,
        height: 125,
      })
    ),
    jsx(Validations, {
      onChange: onChange('validations'),
      formData: props.formData.validations || [],
      schema: getSchema('validations'),
      id: idSchema.validations.__id,
      formContext: props.formContext,
    }),
    jsx(
      'div',
      { css: field },
      jsx(WidgetLabel, { label: formatMessage('Invalid Prompt'), description: getSchema('invalidPrompt').description }),
      jsx(LgEditorWidget, {
        name: 'invalidPrompt',
        onChange: onChange('invalidPrompt'),
        value: formData.invalidPrompt,
        formContext: props.formContext,
        height: 125,
      })
    ),
    jsx(
      'div',
      { css: field },
      jsx(TextWidget, {
        onChange: onChange('value'),
        schema: getSchema('value'),
        id: idSchema.value.__id,
        value: formData.value,
        label: formatMessage('Value'),
        formContext: props.formContext,
        rawErrors: errorSchema.value && errorSchema.value.__errors,
      })
    ),
    jsx(
      'div',
      { css: field },
      jsx(WidgetLabel, {
        label: formatMessage('Default value response'),
        description: getSchema('defaultValueResponse').description,
      }),
      jsx(LgEditorWidget, {
        name: 'defaultValueResponse',
        onChange: onChange('defaultValueResponse'),
        value: formData.defaultValueResponse,
        formContext: props.formContext,
        height: 125,
      })
    )
  );
};
//# sourceMappingURL=Other.js.map
