// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { JsonEditor } from '@bfc/code-editor';

import { ContentProps } from '../constants';

export const ReviewManifest: React.FC<ContentProps> = ({ setErrors, value, onChange }) => {
  const handleError = error => {
    setErrors(error ? { error } : {});
  };

  return <JsonEditor height={'100%'} value={value} onChange={onChange} onError={handleError} />;
};
