// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import AdaptiveForm, { resolveBaseSchema, getUIOptions, mergePluginConfigs } from '@bfc/adaptive-form';
import Extension, { FormErrors } from '@bfc/extension';
import formatMessage from 'format-message';
import isEqual from 'lodash/isEqual';
import debounce from 'lodash/debounce';
import { Resizable, ResizeCallback } from 're-resizable';
import { MicrosoftAdaptiveDialog } from '@bfc/shared';

import { useShell } from '../../shell';
import plugins from '../../plugins';

import { formEditor } from './styles';

const PropertyEditor: React.FC = () => {
  const { api: shellApi, data: shellData } = useShell('PropertyEditor');
  const { currentDialog, data: formData = {}, focusPath, focusedSteps, schemas } = shellData;

  const currentWidth = shellData?.userSettings?.propertyEditorWidth || 400;

  const handleResize: ResizeCallback = (_e, _dir, _ref, d) => {
    shellApi.updateUserSettings({ propertyEditorWidth: currentWidth + d.width });
  };

  const [localData, setLocalData] = useState(formData as MicrosoftAdaptiveDialog);

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
    if (schemas?.sdk?.content && localData) {
      return resolveBaseSchema(schemas.sdk.content, localData);
    }
  }, [schemas?.sdk?.content, localData.$kind]);

  const pluginConfig = useMemo(() => {
    return mergePluginConfigs(...plugins);
  }, []);

  const $uiSchema = useMemo(() => {
    return getUIOptions($schema, pluginConfig.formSchema, pluginConfig.roleSchema);
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
  }, [currentDialog, focusPath, localData]);

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
  const handleDataChange = (newData?: any) => {
    setLocalData(newData);

    if (!isEqual(formData, newData)) {
      shellApi.saveData(newData, focusedSteps[0]);
    }
  };

  return (
    <Resizable
      size={{ width: currentWidth, height: 'auto' }}
      minWidth={400}
      maxWidth={800}
      enable={{
        left: true,
      }}
      onResizeStop={handleResize}
    >
      <div
        css={formEditor}
        aria-label={formatMessage('form editor')}
        data-testid="PropertyEditor"
        key={shellData.focusPath}
      >
        <Extension shell={shellApi} shellData={shellData} plugins={plugins}>
          <AdaptiveForm
            errors={errors}
            formData={shellData.data}
            pluginConfig={pluginConfig}
            schema={$schema}
            uiOptions={$uiSchema}
            onChange={handleDataChange}
          />
        </Extension>
      </div>
    </Resizable>
  );
};

export { PropertyEditor };
