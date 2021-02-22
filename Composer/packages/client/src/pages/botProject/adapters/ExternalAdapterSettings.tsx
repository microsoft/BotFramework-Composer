// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, Fragment } from 'react';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';
import { BotSchemas, DialogSetting } from '@bfc/shared';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { TooltipHost, DirectionalHint } from 'office-ui-fabric-react/lib/Tooltip';
import { SharedColors } from '@uifabric/fluent-theme';
import { JSONSchema7 } from '@botframework-composer/types';

import { schemasState, settingsState, dispatcherState } from '../../../recoilModel';
import { subtitle, tableRow, tableRowItem, tableColumnHeader } from '../styles';

import AdapterModal, { AdapterRecord, hasRequired } from './ExternalAdapterModal';

//////////

type Props = {
  projectId: string;
};

const ExternalAdapterSettings = (props: Props) => {
  const { projectId } = props;

  const schemas = useRecoilValue<BotSchemas>(schemasState(projectId));
  const currentSettings = useRecoilValue<DialogSetting>(settingsState(projectId));
  const { setSettings } = useRecoilValue(dispatcherState);
  const adapters: AdapterRecord[] = currentSettings.runtimeSettings?.adapters ?? [];

  const { definitions: schemaDefinitions } = schemas?.sdk?.content ?? {};
  const uiSchemas = schemas?.ui?.content ?? {};

  const [currentModalProps, setModalProps] = useState<{ key: string; packageName: string } | undefined>();

  const openModal = (key?: string, packageName?: string) => {
    if (key == null || packageName == null) {
      setModalProps(undefined);
    } else {
      setModalProps({ key, packageName });
    }
  };

  if (schemaDefinitions == null) return null;

  const columnWidths = ['300px', '150px', '150px'];

  const externalServices = (schemas: (JSONSchema7 & { key: string; packageName?: string })[]) => (
    <div>
      <div key={'subtitle'} css={subtitle}>
        {formatMessage.rich('Install more adapters in <a>Package Settings</a>.', {
          a: ({ children }) => (
            <Link key="link" href="plugin/package-manager/package-manager">
              {children}
            </Link>
          ),
        })}
      </div>
      <div css={tableRow}>
        <div css={tableColumnHeader(columnWidths[0])}>{formatMessage('Name')}</div>
        <div css={tableColumnHeader(columnWidths[1])}>{formatMessage('Configured')}</div>
        <div css={tableColumnHeader(columnWidths[2])}>{formatMessage('Enabled')}</div>
      </div>

      {schemas.map((schema) => {
        const { key, title } = schema;
        let { packageName } = schema;
        if (packageName == null) packageName = key;

        const keyConfigured =
          packageName in currentSettings && hasRequired(currentSettings[packageName], schemaDefinitions[key].required);
        const keyEnabled = adapters.some((ad) => ad.name === key && ad.enabled);

        return (
          <div key={key} css={tableRow}>
            <div css={tableRowItem(columnWidths[0])}>{title}</div>
            <div css={tableRowItem(columnWidths[1])}>
              {keyConfigured ? (
                <Icon iconName="CheckMark" styles={{ root: { color: SharedColors.green10, fontSize: '18px' } }} />
              ) : (
                <Link key={key} onClick={() => openModal(key, packageName)}>
                  {formatMessage('Configure')}
                </Link>
              )}
            </div>
            <div css={tableRowItem(columnWidths[2])}>
              <Toggle
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
            <TooltipHost content={formatMessage('Actions')} directionalHint={DirectionalHint.rightCenter}>
              <IconButton
                ariaLabel={formatMessage('Actions')}
                className="dialog-more-btn"
                data-testid="dialogMoreButton"
                menuIconProps={{ iconName: 'MoreVertical' }}
                menuProps={{
                  items: [
                    {
                      key: 'edit',
                      text: formatMessage('Edit'),
                      iconProps: { iconName: 'Edit' },
                      onClick: () => openModal(key, packageName),
                    },
                  ],
                }}
                role="cell"
                styles={{ root: { paddingTop: '10px', paddingBottom: '10px' } }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.stopPropagation();
                  }
                }}
              />
            </TooltipHost>
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
      {currentKey != null && currentPackageName != null && schemaDefinitions[currentKey] != null && (
        <AdapterModal
          isOpen
          adapterKey={currentKey}
          packageName={currentPackageName}
          projectId={projectId}
          schema={schemaDefinitions[currentKey]}
          uiSchema={uiSchemas?.[currentKey]?.form}
          value={currentSettings[currentPackageName]}
          onClose={() => {
            openModal(undefined);
          }}
        />
      )}
    </Fragment>
  );
};

export default ExternalAdapterSettings;
