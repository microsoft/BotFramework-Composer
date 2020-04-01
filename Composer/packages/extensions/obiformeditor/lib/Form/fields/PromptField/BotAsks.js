// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { LgEditorWidget } from '../../widgets/LgEditorWidget';
import { WidgetLabel } from '../../widgets/WidgetLabel';
import { field } from './styles';
export var BotAsks = function(props) {
  var onChange = props.onChange,
    getSchema = props.getSchema,
    formData = props.formData,
    formContext = props.formContext;
  return jsx(
    'div',
    { css: field },
    jsx(WidgetLabel, { label: formatMessage('Prompt'), description: getSchema('prompt').description }),
    jsx(LgEditorWidget, {
      name: 'prompt',
      onChange: onChange('prompt'),
      value: formData.prompt,
      formContext: formContext,
      height: 125,
    })
  );
};
//# sourceMappingURL=BotAsks.js.map
