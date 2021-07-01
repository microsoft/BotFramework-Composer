// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, Fragment } from 'react';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';
import { BotSchemas, DialogSetting } from '@bfc/shared';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { JSONSchema7 } from '@botframework-composer/types';
import { AdapterRecord } from '@botframework-composer/types/src';

import { schemasState, settingsState, dispatcherState } from '../../../recoilModel';
import { subtitle, tableHeaderRow, tableRow, tableRowItem, tableColumnHeader, columnSizes } from '../styles';
import { navigateTo } from '../../../utils/navigation';

import AdapterModal, { hasRequired } from './ExternalAdapterModal';

//////////

type Props = {
  projectId: string;
};

type Package = {
  key: string;
  packageName?: string;
};

const ExternalAdapterSettings = (props: Props) => {
  const { projectId } = props;

  const schemas = useRecoilValue<BotSchemas>(schemasState(projectId));
  const currentSettings = useRecoilValue<DialogSetting>(settingsState(projectId));
  const { setSettings } = useRecoilValue(dispatcherState);

  const adapters: AdapterRecord[] = currentSettings.runtimeSettings?.adapters ?? [];

  const { definitions: schemaDefinitions } = schemas?.sdk?.content ?? {};
  const uiSchemas = schemas?.ui?.content ?? {};

  const [currentModalProps, setModalProps] = useState<Package | undefined>();

  const onModalOpen = (pkg: Package) => () => {
    setModalProps(pkg);
  };

  const onModalClose = () => {
    setModalProps(undefined);
  };

  if (schemaDefinitions == null) return null;

  const externalServices = (schemas: (JSONSchema7 & Package)[]) => (
    <div role="table">
      <div css={tableHeaderRow} role="row">
        <div css={tableColumnHeader(columnSizes[0])} role="columnheader">
          {formatMessage('Name')}
        </div>
        <div css={tableColumnHeader(columnSizes[1])} role="columnheader">
          {formatMessage('Enabled')}
        </div>
        <div css={tableColumnHeader(columnSizes[2])} role="columnheader">
          {formatMessage('Configuration')}
        </div>
      </div>

      {schemas.map((schema) => {
        const { key, title } = schema;
        let { packageName } = schema;
        if (packageName == null) packageName = key;

        const keyConfigured =
          packageName in currentSettings && hasRequired(currentSettings[packageName], schemaDefinitions[key].required);
        const keyEnabled = adapters.some((ad) => ad.name === key && ad.enabled);

        return (
          <div key={key} css={tableRow} role="row">
            <div css={tableRowItem(columnSizes[0])} role="cell">
              {title}
            </div>
            <div css={tableRowItem(columnSizes[1])} role="cell">
              <Toggle
                ariaLabel={formatMessage('{title} connection', { title })}
                checked={keyEnabled}
                data-testid={`toggle_${key}`}
                disabled={!keyConfigured}
                styles={{ root: { paddingTop: '8px' } }}
                onChange={(ev, val?: boolean) => {
                  if (val != null) {
                    const oldAdapters = currentSettings.runtimeSettings?.adapters ?? [];
                    setSettings(projectId, {
                      ...currentSettings,
                      runtimeSettings: {
                        ...(currentSettings?.runtimeSettings ?? {}),
                        adapters: oldAdapters.map((ad: AdapterRecord) => {
                          if (ad.name == key) {
                            return { ...ad, enabled: val };
                          } else return ad;
                        }),
                      },
                    });
                  }
                }}
              />
            </div>
            <div css={tableRowItem(columnSizes[2])} role="cell">
              <Link key={key} onClick={onModalOpen({ key, packageName })}>
                {formatMessage('Configure')}
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );

  const adapterSchemas = Object.entries(schemaDefinitions as { [key: string]: JSONSchema7 })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, value]) => value?.$role != null && /IAdapter/.test(value.$role))
    .map(([key, value]) => ({ ...value, key, packageName: value.$package?.name }));

  const currentKey = currentModalProps?.key;
  const currentPackageName = currentModalProps?.packageName;

  return (
    <Fragment>
      <div data-testid="adapterSettings">{externalServices(adapterSchemas)}</div>
      <div key={'subtitle'} css={subtitle}>
        {formatMessage.rich('<a>Add from package manager</a>', {
          a: ({ children }) => (
            <Link
              key="link"
              data-testid="packageManagerDeepLink"
              onClick={() => {
                navigateTo(`/bot/${projectId}/plugin/package-manager/package-manager`);
              }}
            >
              {children}
            </Link>
          ),
        })}
      </div>
      {currentKey != null && currentPackageName != null && schemaDefinitions[currentKey] != null && (
        <AdapterModal
          isOpen
          adapterKey={currentKey}
          packageName={currentPackageName}
          projectId={projectId}
          schema={schemaDefinitions[currentKey]}
          uiSchema={uiSchemas?.[currentKey]?.form}
          value={currentSettings[currentPackageName]}
          onClose={onModalClose}
        />
      )}
    </Fragment>
  );
};

export default ExternalAdapterSettings;
