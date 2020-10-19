// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import AdaptiveForm, { resolveRef, getUIOptions } from '@bfc/adaptive-form';
import { FormErrors, JSONSchema7, useFormConfig, useShellApi } from '@bfc/extension-client';
import formatMessage from 'format-message';
import isEqual from 'lodash/isEqual';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import { MicrosoftAdaptiveDialog } from '@bfc/shared';

import { formEditor } from './styles';

function resolveBaseSchema(schema: JSONSchema7, $kind: string): JSONSchema7 | undefined {
  const defSchema = schema.definitions?.[$kind];
  if (defSchema && typeof defSchema === 'object') {
    return {
      ...resolveRef(defSchema, schema.definitions),
      definitions: schema.definitions,
    };
  }
}

const PropertyEditor: React.FC = () => {
  const { shellApi, ...shellData } = useShellApi();
  const { currentDialog, focusPath, focusedSteps, focusedTab, schemas } = shellData;
  const { onFocusSteps } = shellApi;

  const dialogData = useMemo(() => {
    if (currentDialog?.content) {
      return focusedSteps[0] ? get(currentDialog.content, focusedSteps[0]) : currentDialog.content;
    } else {
      return {};
    }
  }, [currentDialog, focusedSteps[0]]);

  const [localData, setLocalData] = useState(dialogData as MicrosoftAdaptiveDialog);

  const syncData = useRef(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debounce((shellData: any, localData: any) => {
      if (!isEqual(shellData, localData)) {
        setLocalData(shellData);
      }
    }, 300)
  ).current;

  useEffect(() => {
    syncData(dialogData, localData);

    return () => {
      syncData.cancel();
    };
  }, [dialogData]);

  const formUIOptions = useFormConfig();

  const $schema = useMemo(() => {
    if (schemas?.sdk?.content && localData) {
      return resolveBaseSchema(schemas.sdk.content, localData.$kind);
    }
  }, [schemas?.sdk?.content, localData.$kind]);

  const $uiOptions = useMemo(() => {
    return getUIOptions($schema, formUIOptions);
  }, [$schema, formUIOptions]);

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
  }, [currentDialog, focusPath, localData]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (!isEqual(dialogData, localData)) {
        shellApi.saveData(localData, focusedSteps[0]);
      } else {
        shellApi.commitChanges();
      }
    }, 300);

    return () => {
      clearTimeout(id);
    };
  }, [localData]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDataChange = (newData?: any) => {
    setLocalData(newData);
  };

  const handleFocusTab = (focusedTab) => {
    onFocusSteps(focusedSteps, focusedTab);
  };

  return (
    <div aria-label={formatMessage('form editor')} css={formEditor} data-testid="PropertyEditor" role="region">
      <AdaptiveForm
        errors={errors}
        focusedTab={focusedTab}
        formData={localData}
        schema={$schema}
        uiOptions={$uiOptions}
        onChange={handleDataChange}
        onFocusedTab={handleFocusTab}
      />
    </div>
  );
};

export { PropertyEditor };
