// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useMemo } from 'react';
import formatMessage from 'format-message';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { ObjectField } from '@bfc/adaptive-form';
import { useRecoilValue } from 'recoil';
import { DialogSetting } from '@bfc/shared';
import { JSONSchema7 } from '@botframework-composer/types';
import { EditorExtension, PluginConfig } from '@bfc/extension-client';

import { settingsState, dispatcherState } from '../../../recoilModel';
import { useShell } from '../../../shell';
import plugins, { mergePluginConfigs } from '../../../plugins';

export type AdapterRecord = {
  name: string;
  route: string;
  enabled: boolean;
};

type ConfigValue = string | number | boolean;

type Props = {
  adapterKey: string;
  packageName: string;
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  schema: JSONSchema7;
  uiSchema: JSONSchema7;
  value?: { [key: string]: ConfigValue };
};

export function hasRequired(testObject: { [key: string]: ConfigValue }, fields?: string[]) {
  if (fields == null || fields.length === 0) return true;
  return fields.every((field: string) => field in testObject);
}

const AdapterModal = (props: Props) => {
  const { isOpen, onClose, schema, uiSchema, projectId, adapterKey, packageName } = props;

  const [value, setValue] = useState(props.value);
  const { setSettings } = useRecoilValue(dispatcherState);
  const currentSettings = useRecoilValue<DialogSetting>(settingsState(projectId));

  const shell = useShell('DesignPage', projectId);

  const pluginConfig: PluginConfig = useMemo(() => {
    return mergePluginConfigs({ uiSchema } as PluginConfig, plugins);
  }, [uiSchema]);

  const { required } = schema;

  return (
    <EditorExtension plugins={pluginConfig} projectId={projectId} shell={shell}>
      <DialogWrapper
        data-testid={'adapterModal'}
        dialogType={DialogTypes.Customer}
        isOpen={isOpen}
        title={formatMessage('Configure adapter')}
        onDismiss={onClose}
      >
        <div data-testid="adapterModal">
          <ObjectField
            definitions={{}}
            depth={0}
            id={''}
            name={''}
            schema={schema}
            uiOptions={uiSchema}
            value={value}
            onChange={(update?: { [key: string]: any }) => {
              if (update != null) setValue({ ...update, $kind: adapterKey });
            }}
          />
          <DialogFooter>
            <DefaultButton onClick={onClose}>{formatMessage('Back')}</DefaultButton>
            <PrimaryButton
              disabled={value == null || !hasRequired(value, required)}
              onClick={async () => {
                if (value != null) {
                  const currentAdapters: AdapterRecord[] = currentSettings.runtimeSettings?.adapters ?? [];

                  await setSettings(projectId, {
                    ...currentSettings,
                    [packageName]: { ...(currentSettings[packageName] ?? {}), ...value },
                    runtimeSettings: {
                      ...currentSettings.runtimeSettings,
                      adapters: [
                        ...currentAdapters.filter((a) => a.name != adapterKey),
                        { name: adapterKey, enabled: true, route: value.route },
                      ],
                    },
                  });
                }
                onClose();
              }}
            >
              {formatMessage('Create')}
            </PrimaryButton>
          </DialogFooter>
        </div>
      </DialogWrapper>
    </EditorExtension>
  );
};

export default AdapterModal;
