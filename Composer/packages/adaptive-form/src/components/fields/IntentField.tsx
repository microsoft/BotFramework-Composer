// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { FieldProps, useShellApi, useRecognizerConfig, FieldWidget } from '@bfc/extension-client';
import formatMessage from 'format-message';
import { SDKKinds } from '@bfc/shared';

import { FieldLabel } from '../FieldLabel';

const IntentField: React.FC<FieldProps> = (props) => {
  const { id, description, uiOptions, value, required, onChange } = props;
  const { currentDialog } = useShellApi();

  const { recognizers, findRecognizer } = useRecognizerConfig();
  const recognizer = findRecognizer(currentDialog?.content?.recognizer);

  // leak
  let Editor: FieldWidget | undefined;
  if (recognizer && recognizer.id === SDKKinds.CrossTrainedRecognizerSet) {
    Editor = recognizers.find((r) => r.id === SDKKinds.LuisRecognizer)?.intentEditor;
  } else {
    Editor = recognizer?.intentEditor;
  }
  const label = formatMessage('Trigger phrases (intent: #{intentName})', { intentName: value });

  const handleChange = () => {
    onChange(value);
  };

  return (
    <React.Fragment>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />
      {Editor ? (
        <Editor {...props} onChange={handleChange} />
      ) : (
        formatMessage('No Editor for {type}', { type: recognizer?.id })
      )}
    </React.Fragment>
  );
};

export { IntentField };
