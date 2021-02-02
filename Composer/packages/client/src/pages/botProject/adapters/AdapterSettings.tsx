// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, Fragment } from 'react';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';
import { BotSchemas } from '@bfc/shared';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { IconButton, IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { TooltipHost, DirectionalHint } from 'office-ui-fabric-react/lib/Tooltip';
import { SharedColors } from '@uifabric/fluent-theme';

import { schemasState, settingsState } from '../../../recoilModel/atoms';
import { CollapsableWrapper } from '../../../components/CollapsableWrapper';
import { title, subtitle, sectionHeader, tableRow, tableRowItem, tableColumnHeader } from '../styles';
import { JSONSchema7 } from '../../../../../types';
import dispatcher from '../../../recoilModel/dispatchers';

import AdapterModal from './AdapterModal';

////////// STYLES

export const moreButton = (isActive: boolean): IButtonStyles => {
  return {
    root: {
      padding: '4px 4px 0 4px',
      alignSelf: 'stretch',
      visibility: isActive ? 'visible' : 'hidden',
      height: 'auto',
      width: '16px',
      color: '#000',
    },
    menuIcon: {
      fontSize: '12px',
      color: '#000',
    },
  };
};

//////////

type Props = {
  projectId: string;
};

const AdapterSettings = (props: Props) => {
  const { projectId } = props;
  const { setSettings } = dispatcher();

  const schemas = useRecoilValue<BotSchemas>(schemasState(projectId));
  const currentSettings = useRecoilValue(settingsState(projectId));
  const adapters: string[] = currentSettings.adapters ?? [];

  const { definitions: schemaDefinitions } = schemas?.default ?? {};
  const uiSchemas = schemas?.ui?.content ?? {};

  const [connected, setConnected] = useState<Array<string>>([]);

  const [currentModalProps, setModalProps] = useState<{ key: string; callback?: () => void } | undefined>();

  const openModal = (key: string | undefined, callback?: () => void) => {
    if (key == null) {
      setModalProps(undefined);
    } else {
      setModalProps({ key, callback });
    }
  };

  if (schemaDefinitions == null) return null;

  const header = () => <div css={subtitle}>{formatMessage('Connect your bot to other messaging services.')}</div>;

  const azureServices = () => (
    <div>
      <div css={sectionHeader}>{formatMessage('Azure Bot Service adapters')}</div>
    </div>
  );

  const columnWidths = ['300px', '150px', '150px'];

  const externalServices = (schemas: (JSONSchema7 & { key: string })[]) => (
    <div>
      <div css={sectionHeader}>{formatMessage('External service adapters')}</div>
      <div css={tableRow}>
        <div css={tableColumnHeader(columnWidths[0])}>{formatMessage('Name')}</div>
        <div css={tableColumnHeader(columnWidths[1])}>{formatMessage('Configured')}</div>
        <div css={tableColumnHeader(columnWidths[2])}>{formatMessage('Enabled')}</div>
      </div>

      {schemas.map((schema) => {
        const { key, title } = schema;
        const keyEnabled = adapters.includes(key);
        return (
          <div key={key} css={tableRow}>
            <div css={tableRowItem(columnWidths[0])}>{title}</div>
            <div css={tableRowItem(columnWidths[1])}>
              {key in currentSettings ? (
                <Icon iconName="CheckMark" styles={{ root: { color: SharedColors.green10, fontSize: '18px' } }} />
              ) : (
                <Link onClick={() => openModal(key)}>{formatMessage('Configure')}</Link>
              )}
            </div>
            <div css={tableRowItem(columnWidths[2])}>
              <Toggle
                checked={keyEnabled}
                onChange={(ev, val?: boolean) => {
                  if (val && !keyEnabled) {
                    setSettings(projectId, { ...currentSettings, adapters: [...adapters, key] });
                  } else {
                    setSettings(projectId, { ...currentSettings, adapters: adapters.filter((a) => a !== key) });
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
                      onClick: () => openModal(key),
                    },
                  ],
                }}
                role="cell"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.stopPropagation();
                  }
                }}
                styles={{ root: { paddingTop: '10px' } }}
              />
            </TooltipHost>
          </div>
        );
      })}
    </div>
  );

  const adapterSchemas = Object.entries(schemaDefinitions as { [key: string]: JSONSchema7 })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([key, value]) => value?.$role != null && /IAdapter/.test(value.$role))
    .map(([key, value]) => ({ ...value, key }));

  const currentKey = currentModalProps?.key;

  return (
    <Fragment>
      <CollapsableWrapper title={formatMessage('Adapters')} titleStyle={title}>
        {header()}
        {azureServices()}
        {externalServices(adapterSchemas)}
      </CollapsableWrapper>
      {currentKey != null && schemaDefinitions[currentKey] != null && (
        <AdapterModal
          isOpen
          adapterKey={currentKey}
          projectId={projectId}
          schema={schemaDefinitions[currentKey]}
          uiSchema={uiSchemas?.[currentKey]?.form}
          value={currentSettings[currentKey]}
          onClose={() => {
            openModal(undefined);
          }}
        />
      )}
    </Fragment>
  );
};

export default AdapterSettings;
