// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { FieldProps, useRecognizerConfig } from '@bfc/extension-client';
import formatMessage from 'format-message';

import { FieldLabel } from '../FieldLabel';

const IntentField: React.FC<FieldProps> = (props) => {
  const { id, description, uiOptions, value, required, onChange } = props;
  const { currentRecognizer } = useRecognizerConfig();

  const Editor = currentRecognizer?.intentEditor;
  const label = formatMessage('Trigger phrases');

  const handleChange = () => {
    onChange(value);
  };

  return (
    <React.Fragment>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />
      {Editor ? (
        <Editor {...props} onChange={handleChange} />
      ) : (
        formatMessage('No Editor for {type}', { type: currentRecognizer?.id })
      )}
    </React.Fragment>
  );
};

export { IntentField };
