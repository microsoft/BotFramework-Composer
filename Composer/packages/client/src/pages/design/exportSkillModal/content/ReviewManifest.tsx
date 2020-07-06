// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { JsonEditor } from '@bfc/code-editor';
import { useRecoilValue } from 'recoil';

import { ContentProps } from '../constants';
import { userSettingsState } from '../../../../recoilModel';

export const ReviewManifest: React.FC<ContentProps> = ({ setErrors, value, onChange }) => {
  const userSettings = useRecoilValue(userSettingsState);

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
