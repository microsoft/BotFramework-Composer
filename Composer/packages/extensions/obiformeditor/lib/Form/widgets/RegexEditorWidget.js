// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { useState } from 'react';
import { TextWidget } from '.';
function getRegexIntentPattern(currentDialog, intent) {
  var _a;
  var recognizer = currentDialog.content.recognizer;
  var pattern = null;
  if (!recognizer) {
    return null;
  }
  if (recognizer.intents) {
    pattern =
      ((_a = recognizer.intents.find(function(i) {
        return i.intent === intent;
      })) === null || _a === void 0
        ? void 0
        : _a.pattern) || null;
  }
  return pattern;
}
export var RegexEditorWidget = function(props) {
  var formContext = props.formContext,
    name = props.name;
  var currentDialog = formContext.currentDialog;
  var label = formatMessage('Trigger phrases (intent: #{name})', { name: name });
  var _a = useState(getRegexIntentPattern(currentDialog, name)),
    localValue = _a[0],
    setLocalValue = _a[1];
  var handleIntentchange = function(pattern) {
    setLocalValue(pattern);
    formContext.shellApi.updateRegExIntent(currentDialog.id, name, pattern);
  };
  return jsx(TextWidget, {
    id: 'regIntent',
    label: label,
    onChange: handleIntentchange,
    formContext: formContext,
    value: localValue,
  });
};
//# sourceMappingURL=RegexEditorWidget.js.map
