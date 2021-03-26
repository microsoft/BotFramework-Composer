// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogInfo, FieldProps, useRecognizerConfig, useShellApi } from '@bfc/extension-client';
import formatMessage from 'format-message';
import get from 'lodash/get';
import React from 'react';

import { FieldLabel } from '../FieldLabel';

const isLuisRecognizer = (dialog: DialogInfo) => {
  if (!dialog) return false;
  const recognizer = get(dialog, 'content.recognizer', '');
  return typeof recognizer === 'string' && recognizer.endsWith('.lu.qna');
};

const luisEntityHelpUrl = 'https://docs.microsoft.com/en-us/composer/concept-language-understanding#utterances';

const IntentField: React.FC<FieldProps> = (props) => {
  const { id, uiOptions, value, required, onChange } = props;
  const { currentRecognizer } = useRecognizerConfig();
  const { currentDialog } = useShellApi();

  const Editor = currentRecognizer?.intentEditor;
  const label = formatMessage('Trigger phrases');

  let description = props.description;
  let helpLink = uiOptions.helpLink;
  if (isLuisRecognizer(currentDialog)) {
    description = formatMessage(
      'Trigger phrases are inputs from users that will be used to train your LUIS model. This follows .lu file format.'
    );
    helpLink = luisEntityHelpUrl;
  }

  const handleChange = () => {
    onChange(value);
  };

  return (
    <React.Fragment>
      <FieldLabel description={description} helpLink={helpLink} id={id} label={label} required={required} />
      {Editor ? (
        <Editor {...props} onChange={handleChange} />
      ) : (
        formatMessage('No Editor for {type}', { type: currentRecognizer?.id })
      )}
    </React.Fragment>
  );
};

export { IntentField };
