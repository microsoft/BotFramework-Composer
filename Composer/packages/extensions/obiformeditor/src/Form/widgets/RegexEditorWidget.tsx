// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import formatMessage from 'format-message';
import { RegexRecognizer, SDKTypes } from '@bfc/shared';
import { DialogInfo } from '@bfc/indexers';
import { useState } from 'react';

import { FormContext } from '../types';

import { TextWidget } from '.';

interface RegexEditorWidgetProps {
  formContext: FormContext;
  name: string;
  onChange?: (template?: string) => void;
}

function getRegexIntentPattern(currentDialog: DialogInfo, intent: string): string | null {
  const recognizer = currentDialog.content.recognizer.recognizers[0].recognizers?.['en-us'].recognizers.find(
    recog => recog.$type === SDKTypes.RegexRecognizer
  ) as RegexRecognizer;
  let pattern: string | null = null;

  if (!recognizer) {
    return null;
  }

  if (recognizer.intents) {
    pattern = recognizer.intents.find(i => i.intent === intent)?.pattern || null;
  }

  return pattern;
}
export const RegexEditorWidget: React.FC<RegexEditorWidgetProps> = props => {
  const { formContext, name } = props;
  const { currentDialog } = formContext;
  const label = formatMessage('Trigger phrases (intent: #{name})', { name });
  const [localValue, setLocalValue] = useState(getRegexIntentPattern(currentDialog, name));
  const handleIntentchange = (pattern): void => {
    setLocalValue(pattern);
    formContext.shellApi.updateRegExIntent(currentDialog.id, name, pattern);
  };
  return (
    <TextWidget
      id="regIntent"
      label={label}
      onChange={handleIntentchange}
      formContext={formContext}
      value={localValue}
    />
  );
};
