// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useState, useEffect, useMemo } from 'react';
import { useShellApi, PluginConfig, FormErrors } from '@bfc/extension';
import isEqual from 'lodash/isEqual';
import ErrorBoundary from 'react-error-boundary';
import { AdaptiveDialogSchema } from '@bfc/shared';

import PluginContext from '../../PluginContext';
import { resolveBaseSchema, getUISchema, mergePluginConfigs } from '../../utils';
import { SchemaField } from '../SchemaField';

import FormTitle from './FormTitle';
import ErrorInfo from './ErrorInfo';

export interface AdaptiveFormProps {
  schema?: AdaptiveDialogSchema;
  formData?: any;
  plugins: PluginConfig[];
}

export const AdaptiveForm: React.FC<AdaptiveFormProps> = function AdaptiveForm(props) {
  const { shellApi, focusedSteps, currentDialog, focusPath } = useShellApi();
  const { formData, schema, plugins } = props;
  const [localData, setLocalData] = useState(formData);

  useEffect(() => {
    if (formData?.$designer?.id !== localData?.$designer?.id) {
      setLocalData(formData);
    }
  }, [formData]);

  const $schema = useMemo(() => {
    if (schema && localData) {
      return resolveBaseSchema(schema, localData);
    }
  }, [schema, localData]);

  const pluginConfig = useMemo(() => {
    return mergePluginConfigs(...plugins);
  }, []);

  const $uiSchema = useMemo(() => {
    return getUISchema($schema, pluginConfig.uiSchema);
  }, [$schema, pluginConfig]);

  const errors = useMemo(() => {
    const diagnostics = currentDialog?.diagnostics;
    if (diagnostics) {
      const currentPath = focusPath.replace('#', '');

      return diagnostics.reduce((errors, d) => {
        const [dPath, dType, dProp] = d.path?.split('#') || [];
        const dParts = dProp ? dProp.split(/[[\].]+/).filter(Boolean) : [];

        if (dPath === currentPath && dType === localData?.$type) {
          const propErr = dParts.reverse().reduce((err, prop, idx) => {
            if (idx === 0) {
              return { [prop]: d.message };
            } else {
              return { [prop]: err };
            }
          }, {});

          return {
            ...errors,
            ...propErr,
          };
        }

        return errors;
      }, {} as FormErrors);
    }

    return {};
  }, [currentDialog, focusPath, localData]);

  if (!localData) {
    return <>No Data</>;
  }

  if (!$schema) {
    return null;
  }

  const handleDataChange = (newData?: any) => {
    setLocalData(newData);

    if (!isEqual(formData, newData)) {
      shellApi.saveData(newData, focusedSteps[0]);
    }
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorInfo}>
      <div key={localData?.$designer?.id}>
        <PluginContext.Provider value={pluginConfig}>
          <FormTitle
            formData={localData}
            id={localData.$designer?.id || 'unknown'}
            schema={$schema}
            onChange={$designer => handleDataChange({ ...localData, $designer })}
            uiOptions={$uiSchema}
          />
          <SchemaField
            definitions={schema?.definitions}
            depth={-1}
            id="root"
            name="root"
            rawErrors={errors}
            schema={$schema}
            uiOptions={$uiSchema}
            value={localData}
            onChange={handleDataChange}
          />
        </PluginContext.Provider>
      </div>
    </ErrorBoundary>
  );
};
