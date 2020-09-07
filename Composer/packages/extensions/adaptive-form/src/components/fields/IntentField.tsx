// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { FieldProps, useShellApi, useRecognizerConfig, FieldWidget } from '@bfc/extension';
import formatMessage from 'format-message';
import { SDKKinds } from '@bfc/shared';

import { FieldLabel } from '../FieldLabel';

const IntentField: React.FC<FieldProps> = (props) => {
  const { id, description, uiOptions, value, required, onChange } = props;
  const { currentDialog } = useShellApi();
  const recognizers = useRecognizerConfig();

  const handleChange = () => {
    onChange(value);
  };

  const recognizer = recognizers.find((r) => r.isSelected(currentDialog?.content?.recognizer));
  let Editor: FieldWidget | undefined;
  if (recognizer && recognizer.id === SDKKinds.CrossTrainedRecognizerSet) {
    Editor = recognizers.find((r) => r.id === SDKKinds.LuisRecognizer)?.editor;
  } else {
    Editor = recognizer?.editor;
  }
  const label = formatMessage('Trigger phrases (intent: #{intentName})', { intentName: value });

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
