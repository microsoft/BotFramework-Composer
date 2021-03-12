// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useMemo } from 'react';
import formatMessage from 'format-message';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { ObjectField } from '@bfc/adaptive-form';
import { useRecoilValue } from 'recoil';
import { DialogSetting } from '@bfc/shared';
import { JSONSchema7 } from '@botframework-composer/types';
import { EditorExtension, PluginConfig } from '@bfc/extension-client';
import mapValues from 'lodash/mapValues';
import { JSONSchema7Type } from 'json-schema';

import { settingsState, dispatcherState } from '../../../recoilModel';
import { useShell } from '../../../shell';
import plugins, { mergePluginConfigs } from '../../../plugins';

export type AdapterRecord = {
  name: string;
  route: string;
  enabled: boolean;
};

type Props = {
  adapterKey: string;
  packageName: string;
  isOpen: boolean;
  isFirstTime: boolean; // true if the user clicked Configure to get here, false if it's from the Edit menu
  onClose: () => void;
  projectId: string;
  schema: JSONSchema7;
  uiSchema: JSONSchema7 & { helpLink?: string };
  value?: { [key: string]: JSONSchema7Type | undefined };
};

export function hasRequired(testObject: { [key: string]: JSONSchema7Type | undefined }, fields?: string[]) {
  if (fields == null || fields.length === 0) return true;
  return fields.every((field: string) => field in testObject);
}

function makeDefault(schema: JSONSchema7) {
  const { properties } = schema;

  return mapValues(properties, 'default');
}

const AdapterModal = (props: Props) => {
  const { isOpen, onClose, schema, uiSchema, projectId, adapterKey, packageName, isFirstTime } = props;

  const [value, setValue] = useState(props.value ?? makeDefault(schema));
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
          <Text key="helptext">
            {formatMessage.rich('To learn more about the { title }, <a>visit its documentation page</a>.', {
              title: schema.title,
              a: ({ children }) => (
                <Link href={uiSchema.helpLink} target="_blank">
                  {children}
                </Link>
              ),
            })}
          </Text>
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
              {isFirstTime ? formatMessage('Create') : formatMessage('Confirm')}
            </PrimaryButton>
          </DialogFooter>
        </div>
      </DialogWrapper>
    </EditorExtension>
  );
};

export default AdapterModal;
