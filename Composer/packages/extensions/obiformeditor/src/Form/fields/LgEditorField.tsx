// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Suspense } from 'react';

import { BFDFieldProps } from '../types';
import { LoadingSpinner } from '../../LoadingSpinner';

import { BaseField } from './BaseField';

const LgEditorWidget = React.lazy(() => import('../widgets/LgEditorWidget'));

export const LgEditorField: React.FC<BFDFieldProps> = props => {
  return (
    <BaseField {...props}>
      <Suspense fallback={<LoadingSpinner />}>
        <LgEditorWidget
          name={props.name}
          value={props.formData}
          formContext={props.formContext}
          onChange={props.onChange}
        />
      </Suspense>
    </BaseField>
  );
};
