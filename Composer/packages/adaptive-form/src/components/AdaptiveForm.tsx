// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import { FormErrors, JSONSchema7, UIOptions } from '@bfc/extension-client';
import ErrorBoundary from 'react-error-boundary';
import formatMessage from 'format-message';
import { FontSizes } from '@uifabric/fluent-theme';

import AdaptiveFormContext from '../AdaptiveFormContext';

import { SchemaField } from './SchemaField';
import FormTitle from './FormTitle';
import ErrorInfo from './ErrorInfo';
import { LoadingTimeout } from './LoadingTimeout';

export interface AdaptiveFormProps {
  errors?: string | FormErrors | string[] | FormErrors[];
  schema?: JSONSchema7;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData?: any;
  uiOptions: UIOptions;
  focusedTab?: string;
  onFocusedTab?: (tab: string) => void;
  onChange: (value: any) => void;
}

const schemaLoadErrorStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: ${FontSizes.size14};
`;

export const AdaptiveForm: React.FC<AdaptiveFormProps> = function AdaptiveForm(props) {
  const { errors, focusedTab, formData, schema, uiOptions, onChange, onFocusedTab } = props;

  if (!formData && !schema) {
    return (
      <div css={schemaLoadErrorStyle}>
        <LoadingTimeout timeout={2000}>
          <p>
            {formatMessage('{type} could not be loaded', {
              type: formData ? formatMessage('Schema') : formatMessage('Dialog data'),
            })}
          </p>
        </LoadingTimeout>
      </div>
    );
  }

  if (schema) {
    return (
      <ErrorBoundary FallbackComponent={ErrorInfo}>
        <AdaptiveFormContext.Provider value={{ focusedTab, onFocusedTab, baseSchema: schema }}>
          <FormTitle
            formData={formData}
            id={formData?.$designer?.id || 'unknown'}
            schema={schema}
            uiOptions={uiOptions}
            onChange={(newData) => onChange({ ...formData, ...newData })}
          />
          <SchemaField
            definitions={schema?.definitions}
            depth={-1}
            id={formData?.$designer?.id ? `root[${formData?.$designer?.id}]` : 'root'}
            name="root"
            rawErrors={errors}
            schema={schema}
            uiOptions={uiOptions}
            value={formData}
            onChange={onChange}
          />
        </AdaptiveFormContext.Provider>
      </ErrorBoundary>
    );
  }
  return null;
};
