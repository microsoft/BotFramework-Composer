// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { css } from '@emotion/core';
import React, { useMemo } from 'react';
import { FormErrors, JSONSchema7, UIOptions, PluginConfig } from '@bfc/extension';
import ErrorBoundary from 'react-error-boundary';
import formatMessage from 'format-message';

import PluginContext from '../PluginContext';
import { mergePluginConfigs } from '../utils/mergePluginConfigs';

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
  pluginConfig?: Required<PluginConfig>;
  uiOptions: UIOptions;
  onChange: (value: any) => void;
}

export const AdaptiveForm: React.FC<AdaptiveFormProps> = function AdaptiveForm(props) {
  const { errors, formData, pluginConfig, schema, uiOptions, onChange } = props;

  const $pluginConfig = useMemo(() => {
    return pluginConfig || mergePluginConfigs();
  }, [pluginConfig]);

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
      <PluginContext.Provider value={$pluginConfig}>
        <FormTitle
          formData={formData}
          id={formData.$designer?.id || 'unknown'}
          schema={schema}
          uiOptions={uiOptions}
          onChange={($designer) => onChange({ ...formData, $designer })}
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
      </PluginContext.Provider>
    </ErrorBoundary>
  );
};
