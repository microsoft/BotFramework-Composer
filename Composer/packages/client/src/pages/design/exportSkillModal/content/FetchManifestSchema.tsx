// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect } from 'react';

import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { ContentProps } from '../constants';

export const FetchManifestSchema: React.FC<ContentProps> = ({ completeStep, value, setSchema }) => {
  useEffect(() => {
    (async function() {
      if (value && value?.$schema) {
        const res = await fetch(value.$schema);
        const schema = await res.json();
        setSchema(schema);
        completeStep();
      }
    })();
  }, [value]);

  return <LoadingSpinner />;
};
