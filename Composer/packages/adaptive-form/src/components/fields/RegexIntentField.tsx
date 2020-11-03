// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useEffect } from 'react';
import { FieldProps, useShellApi, MicrosoftIDialog } from '@bfc/extension-client';
import { RegexRecognizer } from '@bfc/shared';

import { useFormData } from '../../hooks';

import { StringField } from './StringField';

function getRegexIntentPattern(formData: MicrosoftIDialog, intent: string): string {
  const recognizer = formData.recognizer as RegexRecognizer;
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
  const formData = useFormData();
  const [localValue, setLocalValue] = useState(getRegexIntentPattern(formData, intentName));

  // if the intent name changes or intent names in the regex patterns
  // we need to reset the local value
  useEffect(() => {
    const pattern = getRegexIntentPattern(formData, intentName);
    setLocalValue(pattern);
  }, [intentName, (formData.recognizer as RegexRecognizer)?.intents.map((i) => i.intent)]);

  const handleIntentChange = (pattern?: string) => {
    setLocalValue(pattern ?? '');
    shellApi.updateRegExIntent(currentDialog.id, intentName, pattern ?? '');
  };

  return <StringField {...rest} label={false} value={localValue} onChange={handleIntentChange} />;
};

export { RegexIntentField };
