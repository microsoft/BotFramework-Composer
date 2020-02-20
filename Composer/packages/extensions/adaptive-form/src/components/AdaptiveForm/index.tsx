// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useState, useEffect, useMemo } from 'react';
import { useShellApi, PluginConfig, UISchema, FormErrors } from '@bfc/extension';
import isEqual from 'lodash/isEqual';
import ErrorBoundary from 'react-error-boundary';
import { AdaptiveDialogSchema } from '@bfc/shared';

import FormContext from '../../FormContext';
import { resolveBaseSchema, getUISchema, resolveFieldWidget } from '../../utils';
import { mergeUISchema } from '../../utils/mergeUISchema';

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

  const globalUiSchema = useMemo(() => {
    const uiSchemas = plugins.reduce<UISchema[]>((acc, plugin) => {
      if (plugin.uiSchema) {
        acc.push(plugin.uiSchema);
      }

      return acc;
    }, []);

    return mergeUISchema(...uiSchemas);
  }, []);

  const $uiSchema = useMemo(() => {
    return getUISchema(localData?.$type, globalUiSchema);
  }, [localData?.$type, globalUiSchema]);

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

  const Field = resolveFieldWidget($schema, $uiSchema, globalUiSchema);

  return (
    <ErrorBoundary FallbackComponent={ErrorInfo}>
      <div key={localData?.$designer?.id}>
        <FormContext.Provider value={{ uiSchema: globalUiSchema }}>
          <FormTitle
            formData={localData}
            id={localData.$designer?.id || 'unknown'}
            schema={$schema}
            onChange={$designer => handleDataChange({ ...localData, $designer })}
          />
          <Field
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
        </FormContext.Provider>
      </div>
    </ErrorBoundary>
  );
};
