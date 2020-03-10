// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { FieldProps, useShellApi } from '@bfc/extension';
import { DialogInfo, SDKTypes } from '@bfc/shared';
import formatMessage from 'format-message';

import { usePluginConfig } from '../../hooks';
import { FieldLabel } from '../FieldLabel';

// TODO: extend recognizer config to support this
function recognizerType({ content }: DialogInfo): string | null {
  const { recognizer } = content;

  if (recognizer) {
    if (typeof recognizer === 'object' && recognizer.$type === SDKTypes.RegexRecognizer) {
      return SDKTypes.RegexRecognizer;
    } else if (typeof recognizer === 'string') {
      return SDKTypes.LuisRecognizer;
    }
  }

  return null;
}

const IntentField: React.FC<FieldProps> = props => {
  const { id, description, uiOptions, value } = props;
  const { currentDialog } = useShellApi();
  const { recognizers } = usePluginConfig();
  const type = recognizerType(currentDialog);

  const handleChange = (...args) => {
    console.log('[BFC] intent field change', ...args);
  };

  const Editor = recognizers.find(r => r.id === type)?.editor;
  const label = formatMessage('Trigger phrases (intent: #{intentName})', { intentName: value });

  return (
    <React.Fragment>
      <FieldLabel id={id} label={label} description={description} helpLink={uiOptions?.helpLink} />
      {Editor ? <Editor {...props} onChange={handleChange} /> : `No Editor for ${type}`}
    </React.Fragment>
  );
};

export { IntentField };
