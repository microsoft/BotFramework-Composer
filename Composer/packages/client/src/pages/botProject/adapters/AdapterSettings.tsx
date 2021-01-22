// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, Fragment } from 'react';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';
import { BotSchemas } from '@bfc/shared';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';

import { schemasState, botProjectFileState } from '../../../recoilModel/atoms';
import { CollapsableWrapper } from '../../../components/CollapsableWrapper';
import { title, subtitle, sectionHeader, tableRow, tableRowItem } from '../styles';
import { JSONSchema7 } from '../../../../../types';

import AdapterModal from './AdapterModal';

type Props = {
  projectId: string;
};

const AdapterSettings = (props: Props) => {
  const { projectId } = props;

  const { default: sdk } = useRecoilValue<BotSchemas>(schemasState(projectId));
  const { definitions } = sdk ?? {};

  const fileState = useRecoilValue(botProjectFileState(projectId));
  console.log(fileState);

  const [connected, setConnected] = useState<Array<string>>([]);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);

  const [currentSchema, setCurrentSchema] = useState<JSONSchema7 | undefined>();
  const [currentCallback, setCurrentCallback] = useState<() => void | undefined>();

  const openModal = (sch: JSONSchema7 & { key: string }, onClose: () => void) => {
    setCurrentSchema(sch);
    setCurrentCallback(onClose);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  function addConnection(name: string) {
    setConnected([...connected, name]);
  }

  function removeConnection(name: string) {
    setConnected(connected.filter((conn) => conn !== name));
  }

  function isConnected(name: string) {
    return connected.includes(name);
  }

  if (definitions == null) return null;

  const header = () => <div css={subtitle}>{formatMessage('Connect your bot to other messaging services.')}</div>;

  const azureServices = () => (
    <div>
      <div css={sectionHeader}>{formatMessage('Azure Bot Service adapters')}</div>
    </div>
  );

  const externalServices = (schemas: (JSONSchema7 & { key: string })[]) => (
    <div>
      <div css={sectionHeader}>{formatMessage('External service adapters')}</div>

      {schemas.map((sch) => (
        <div key={sch.key} css={tableRow}>
          <div css={tableRowItem}>{sch.title}</div>
          <div css={tableRowItem}>
            {isConnected(sch.key) ? (
              <ActionButton
                iconProps={{ iconName: 'PlugDisconnected' }}
                onClick={() => openModal(sch, () => removeConnection(sch.key))}
              >
                {formatMessage('Disconnect')}
              </ActionButton>
            ) : (
              <ActionButton
                iconProps={{ iconName: 'PlugConnected' }}
                onClick={() => openModal(sch, () => addConnection(sch.key))}
              >
                {formatMessage('Connect')}
              </ActionButton>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const adapterSchemas = Object.entries(definitions)
    .filter(([_, value]) => value?.$role != null && /IAdapter/.test(value.$role))
    .map(([key, value]) => ({ ...value, key }));

  return (
    <Fragment>
      <CollapsableWrapper title={formatMessage('Adapters')} titleStyle={title}>
        {header()}
        {azureServices()}
        {externalServices(adapterSchemas)}
      </CollapsableWrapper>
      {currentSchema != null && (
        <AdapterModal
          isOpen={isModalOpen}
          schema={currentSchema}
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
