// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, Fragment } from 'react';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';
import { BotSchemas } from '@bfc/shared';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';

import { schemasState } from '../../../recoilModel/atoms';
import { CollapsableWrapper } from '../../../components/CollapsableWrapper';
import { title, subtitle, sectionHeader, tableRow, tableRowItem } from '../styles';
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

  const [currentKey, setKey] = useState<string | undefined>();
  const [currentCallback, setCurrentCallback] = useState<(() => void) | undefined>();

  const openModal = (key: string | undefined, onClose: (() => void) | undefined) => {
    setKey(key);
    setCurrentCallback(onClose);
  };
  console.log('k', currentKey);
  const closeModal = () => openModal(undefined, undefined);

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

  const externalServices = (schemas: (JSONSchema7 & { key: string })[]) => (
    <div>
      <div css={sectionHeader}>{formatMessage('External service adapters')}</div>

      {schemas.map((sch) => {
        return (
          <div key={sch.key} css={tableRow}>
            <div css={tableRowItem}>{sch.title}</div>
            <div css={tableRowItem}>
              {isConnected(sch.key) ? (
                <ActionButton
                  iconProps={{ iconName: 'PlugDisconnected' }}
                  onClick={() => openModal(sch.key, () => removeConnection(sch.key))}
                >
                  {formatMessage('Disconnect')}
                </ActionButton>
              ) : (
                <ActionButton
                  iconProps={{ iconName: 'PlugConnected' }}
                  onClick={() => openModal(sch.key, () => addConnection(sch.key))}
                >
                  {formatMessage('Connect')}
                </ActionButton>
              )}
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

  console.log(`'${currentKey ?? ''}'`, schemaDefinitions[currentKey ?? ''], uiSchemas?.[currentKey ?? '']?.form);

  console.log(schemaDefinitions, uiSchemas);

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
          schema={schemaDefinitions[currentKey]}
          uiSchema={uiSchemas?.form[currentKey]}
          onCancel={closeModal}
          onConfirm={() => {
            closeModal();
            currentCallback?.();
          }}
        />
      )}
    </Fragment>
  );
};

export default AdapterSettings;
