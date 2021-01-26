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
import { SharedColors } from '@uifabric/fluent-theme';

import { schemasState } from '../../../recoilModel/atoms';
import { CollapsableWrapper } from '../../../components/CollapsableWrapper';
import { title, subtitle, sectionHeader, tableRow, tableRowItem, tableColumnHeader } from '../styles';
import { JSONSchema7 } from '../../../../../types';

import AdapterModal from './AdapterModal';

type Props = {
  projectId: string;
};

const AdapterSettings = (props: Props) => {
  const { projectId } = props;

  const schemas = useRecoilValue<BotSchemas>(schemasState(projectId));

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

  function addConnection(name: string) {
    setConnected([...connected, name]);
  }

  function removeConnection(name: string) {
    setConnected(connected.filter((conn) => conn !== name));
  }

  function isConnected(name: string) {
    return connected.includes(name);
  }

  if (schemaDefinitions == null) return null;

  const header = () => <div css={subtitle}>{formatMessage('Connect your bot to other messaging services.')}</div>;

  const azureServices = () => (
    <div>
      <div css={sectionHeader}>{formatMessage('Azure Bot Service adapters')}</div>
    </div>
  );

  const columnWidths = [50, 25, 25];

  const externalServices = (schemas: (JSONSchema7 & { key: string })[]) => (
    <div>
      <div css={sectionHeader}>{formatMessage('External service adapters')}</div>
      <div css={tableRow}>
        <div css={tableColumnHeader(columnWidths[0])}>{formatMessage('Name')}</div>
        <div css={tableColumnHeader(columnWidths[1])}>{formatMessage('Configured')}</div>
        <div css={tableColumnHeader(columnWidths[2])}>{formatMessage('Enabled')}</div>
      </div>

      {schemas.map((sch) => {
        return (
          <div key={sch.key} css={tableRow}>
            <div css={tableRowItem(columnWidths[0])}>{sch.title}</div>
            <div css={tableRowItem(columnWidths[1])}>
              {isConnected(sch.key) ? (
                <Icon iconName="CheckMark" styles={{ root: { color: SharedColors.green10 } }} />
              ) : (
                <Link onClick={() => openModal(sch.key, () => addConnection(sch.key))}>
                  {formatMessage('Configure')}
                </Link>
              )}
            </div>
            <div css={tableRowItem(columnWidths[2])}>
              <Toggle />
            </div>
          </div>
        );
      })}
    </div>
  );

  const adapterSchemas = Object.entries(schemaDefinitions)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([key, value]: [string, JSONSchema7]) => value?.$role != null && /IAdapter/.test(value.$role))
    .map(([key, value]: [string, JSONSchema7]) => ({ ...value, key }));

  return (
    <Fragment>
      <CollapsableWrapper title={formatMessage('Adapters')} titleStyle={title}>
        {header()}
        {azureServices()}
        {externalServices(adapterSchemas)}
      </CollapsableWrapper>
      {currentModalProps != null && schemaDefinitions[currentModalProps.key] != null && (
        <AdapterModal
          key={currentModalProps.key}
          isOpen
          schema={schemaDefinitions[currentModalProps.key]}
          uiSchema={uiSchemas?.[currentModalProps.key]?.form}
          onClose={() => {
            openModal(undefined);
          }}
        />
      )}
    </Fragment>
  );
};

export default AdapterSettings;
