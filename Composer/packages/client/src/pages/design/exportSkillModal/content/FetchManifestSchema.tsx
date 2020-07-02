// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect } from 'react';

import { LoadingSpinner } from '../../../../components/LoadingSpinner/LoadingSpinner';
import { ContentProps } from '../constants';

export const FetchManifestSchema: React.FC<ContentProps> = ({ completeStep, editJson, value, setSchema }) => {
  useEffect(() => {
    (async function () {
      try {
        if (value && value?.$schema) {
          const res = await fetch(value.$schema);
          const schema = await res.json();
          setSchema(schema);
          completeStep();
        } else {
          editJson();
        }
      } catch (error) {
        editJson();
      }
    })();
  }, [value]);

  return <LoadingSpinner />;
};
