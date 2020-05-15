// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo } from 'react';
import { FormErrors, JSONSchema7, UIOptions, PluginConfig } from '@bfc/extension';
import ErrorBoundary from 'react-error-boundary';

import PluginContext from '../../PluginContext';
import { SchemaField } from '../SchemaField';
import { mergePluginConfigs } from '../../utils/mergePluginConfigs';

import FormTitle from './FormTitle';
import ErrorInfo from './ErrorInfo';

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

  if (!formData) {
    return <>No Data</>;
  }

  if (!schema) {
    return null;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorInfo}>
      <PluginContext.Provider value={$pluginConfig}>
        <FormTitle
          formData={formData}
          id={formData.$designer?.id || 'unknown'}
          schema={schema}
          onChange={$designer => onChange({ ...formData, $designer })}
          uiOptions={uiOptions}
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
