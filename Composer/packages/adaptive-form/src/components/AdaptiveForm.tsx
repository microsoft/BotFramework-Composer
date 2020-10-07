// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import { FormErrors, JSONSchema7, UIOptions } from '@bfc/extension-client';
import ErrorBoundary from 'react-error-boundary';
import formatMessage from 'format-message';

import AdaptiveFormContext from '../AdaptiveFormContext';

import { SchemaField } from './SchemaField';
import FormTitle from './FormTitle';
import ErrorInfo from './ErrorInfo';
import { LoadingTimeout } from './LoadingTimeout';

const styles = {
  errorLoading: css`
    padding: 18px;
  `,
};

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

export const AdaptiveForm: React.FC<AdaptiveFormProps> = function AdaptiveForm(props) {
  const { errors, focusedTab, formData, schema, uiOptions, onChange, onFocusedTab } = props;

  if (!formData || !schema) {
    return (
      <LoadingTimeout timeout={2000}>
        <div css={styles.errorLoading}>
          {formatMessage('{type} could not be loaded', {
            type: formData ? formatMessage('Schema') : formatMessage('Dialog data'),
          })}
        </div>
      </LoadingTimeout>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorInfo}>
      <AdaptiveFormContext.Provider value={{ focusedTab, onFocusedTab, baseSchema: schema }}>
        <FormTitle
          formData={formData}
          id={formData.$designer?.id || 'unknown'}
          schema={schema}
          uiOptions={uiOptions}
          onChange={(newData) => onChange({ ...formData, ...newData })}
        />
        <SchemaField
          definitions={schema?.definitions}
          depth={-1}
          id="root"
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
};
