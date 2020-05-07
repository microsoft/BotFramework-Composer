// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import formatMessage from 'format-message';
import { LgEditorWidget } from '../../widgets/LgEditorWidget';
import { WidgetLabel } from '../../widgets/WidgetLabel';
export var BotAsks = function(props) {
  var onChange = props.onChange,
    getSchema = props.getSchema,
    formData = props.formData,
    formContext = props.formContext;
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(WidgetLabel, { label: formatMessage('Prompt'), description: getSchema('prompt').description }),
    React.createElement(LgEditorWidget, {
      name: 'prompt',
      onChange: onChange('prompt'),
      value: formData.prompt,
      formContext: formContext,
      height: 125,
    })
  );
};
//# sourceMappingURL=BotAsks.js.map
