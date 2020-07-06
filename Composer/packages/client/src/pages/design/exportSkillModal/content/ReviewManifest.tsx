// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { JsonEditor } from '@bfc/code-editor';

import { ContentProps } from '../constants';
import { useStoreContext } from '../../../../hooks/useStoreContext';

export const ReviewManifest: React.FC<ContentProps> = ({ setErrors, value, onChange }) => {
  const {
    state: { userSettings },
  } = useStoreContext();

  const handleError = (error) => {
    setErrors(error ? { error } : {});
  };

  return (
    <JsonEditor
      editorSettings={userSettings.codeEditor}
      height={'100%'}
      value={value}
      onChange={onChange}
      onError={handleError}
    />
  );
};
