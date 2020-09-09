// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useEffect } from 'react';
import { FieldProps, useShellApi } from '@bfc/extension';
import { DialogInfo, RegexRecognizer } from '@bfc/shared';

import { StringField } from './StringField';

function getRegexIntentPattern(currentDialog: DialogInfo, intent: string): string {
  const recognizer = currentDialog.content.recognizer as RegexRecognizer;
  let pattern = '';

  if (!recognizer) {
    return '';
  }

  if (recognizer.intents) {
    pattern = recognizer.intents.find((i) => i.intent === intent)?.pattern || '';
  }

  return pattern;
}

const RegexIntentField: React.FC<FieldProps> = ({ value: intentName, ...rest }) => {
  const { currentDialog, shellApi } = useShellApi();
  const [localValue, setLocalValue] = useState(getRegexIntentPattern(currentDialog, intentName));

  // if the intent name changes or intent names in the regex patterns
  // we need to reset the local value
  useEffect(() => {
    const pattern = getRegexIntentPattern(currentDialog, intentName);
    setLocalValue(pattern);
  }, [intentName, currentDialog.content.recognizer?.intents.map((i) => i.intent)]);

  const handleIntentChange = (pattern?: string) => {
    setLocalValue(pattern ?? '');
    shellApi.updateRegExIntent(currentDialog.id, intentName, pattern ?? '');
  };

  return <StringField {...rest} label={false} value={localValue} onChange={handleIntentChange} />;
};

export { RegexIntentField };
