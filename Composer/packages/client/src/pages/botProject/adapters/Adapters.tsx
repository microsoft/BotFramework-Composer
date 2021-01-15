// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useState } from 'react';
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import { ActionButton, IconButton } from 'office-ui-fabric-react/lib/Button';

import { CollapsableWrapper } from '../../../components/CollapsableWrapper';
import { rootBotProjectIdSelector } from '../../../recoilModel/selectors/project';
import { dispatcherState, settingsState } from '../../../recoilModel';
import { titleStyle, sectionHeader, tableRow, tableItem, tableHeader, tableHeaderText } from '../common';

import { AdapterModal } from './AdapterModal';

// -------------------- SkillHostEndPoint -------------------- //

const header = () => (
  <div css={sectionHeader}>
    {formatMessage('Adapters are installed by the package manager. Add adapters to connect your bot to channels.')}
  </div>
);
export const Adapters: React.FC = () => {
  const [isModalOpen, showModal] = useState<boolean>(false);
  const [modalKey, setModalKey] = useState<number>(0);
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector) ?? '';
  const { setSettings } = useRecoilValue(dispatcherState);
  const settings = useRecoilValue(settingsState(rootBotProjectId));
  const { adapters } = settings;

  const addAdapterButton = () => (
    <ActionButton
      iconProps={{ iconName: 'Add' }}
      onClick={() => {
        setModalKey(modalKey + 1);
        showModal(true);
      }}
    >
      {formatMessage('Add adapter')}
    </ActionButton>
  );

  let initData: AdapterConfig | undefined = undefined;

  return (
    <CollapsableWrapper title={formatMessage('Adapters')} titleStyle={titleStyle}>
      {header()}
      {addAdapterButton()}
      <div css={tableHeader}>
        <div css={tableHeaderText}>{formatMessage('Name')} </div>
        <div css={tableHeaderText}>{formatMessage('Type')} </div>
      </div>
      {adapters &&
        Object.entries(adapters).map((entry, index) => {
          const [key, adapter] = entry;
          return (
            <div key={index} css={tableRow}>
              <div css={tableItem} title={adapter.name}>
                {adapter.name}
              </div>
              <div css={tableItem} title={adapter.type}>
                {adapter.type}
              </div>
              <IconButton
                ariaLabel="Edit"
                iconProps={{ iconName: 'Edit' }}
                title="Edit"
                onClick={() => {
                  initData = adapter;
                  showModal(true);
                }}
              />
              <IconButton
                ariaLabel="Delete"
                iconProps={{ iconName: 'Delete' }}
                title="Delete"
                onClick={() => {
                  setSettings(rootBotProjectId, {
                    ...settings,
                    adapters: adapters.filter((a) => a.key !== key),
                  });
                }}
              />
            </div>
          );
        })}
      <AdapterModal
        key={modalKey}
        handleConfirm={(data) =>
          setSettings(rootBotProjectId, {
            ...settings,
            adapters: adapters == null ? { [modalKey]: data } : { ...adapters, [modalKey]: data },
          })
        }
        initData={initData}
        isOpen={isModalOpen}
        title={formatMessage('Add adapter')}
        onClose={() => {
          showModal(false);
        }}
      />
    </CollapsableWrapper>
  );
};
