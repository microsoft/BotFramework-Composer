// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useShellApi, FormErrors, JSONSchema7 } from '@bfc/extension';
import ErrorBoundary from 'react-error-boundary';
import isEqual from 'lodash/isEqual';
import debounce from 'lodash/debounce';

import PluginContext from '../../PluginContext';
import { resolveBaseSchema, getUISchema, mergePluginConfigs } from '../../utils';
import { SchemaField } from '../SchemaField';

import FormTitle from './FormTitle';
import ErrorInfo from './ErrorInfo';

export interface AdaptiveFormProps {
  schema?: JSONSchema7;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData?: any;
}

export const AdaptiveForm: React.FC<AdaptiveFormProps> = function AdaptiveForm(props) {
  const { shellApi, focusedSteps, currentDialog, focusPath, plugins } = useShellApi();
  const { formData, schema } = props;
  const [localData, setLocalData] = useState(formData);

  const syncData = useRef(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debounce((shellData: any, localData: any) => {
      if (!isEqual(shellData, localData)) {
        setLocalData(shellData);
      }
    }, 300)
  ).current;

  useEffect(() => {
    syncData(formData, localData);

    return () => {
      syncData.cancel();
    };
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
    return getUISchema($schema, pluginConfig.formSchema);
  }, [$schema, pluginConfig]);

  const errors = useMemo(() => {
    const diagnostics = currentDialog?.diagnostics;
    if (diagnostics) {
      const currentPath = focusPath.replace('#', '');

      return diagnostics.reduce((errors, d) => {
        const [dPath, dType, dProp] = d.path?.split('#') || [];
        const dParts = dProp ? dProp.split(/[[\].]+/).filter(Boolean) : [];

        if (dPath === currentPath && dType === localData?.$kind) {
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
  }, [currentDialog?.diagnostics, focusPath, localData?.$kind]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (!isEqual(formData, localData)) {
        shellApi.saveData(localData, focusedSteps[0]);
      }
    }, 300);

    return () => {
      clearTimeout(id);
    };
  }, [localData]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDataChange = useCallback((newData?: any) => {
    setLocalData(newData);
  }, []);

  if (!localData) {
    return null;
  }

  if (!$schema) {
    return null;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorInfo}>
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
    </ErrorBoundary>
  );
};
