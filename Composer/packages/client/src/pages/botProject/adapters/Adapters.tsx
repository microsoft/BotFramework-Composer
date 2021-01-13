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
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector) ?? '';
  const { setSettings } = useRecoilValue(dispatcherState);
  const settings = useRecoilValue(settingsState(rootBotProjectId));
  const { adapters } = settings;

  const addAdapterButton = () => (
    <ActionButton iconProps={{ iconName: 'Add' }} onClick={() => showModal(true)}>
      {formatMessage('Add adapter')}
    </ActionButton>
  );

  return (
    <CollapsableWrapper title={formatMessage('Adapters')} titleStyle={titleStyle}>
      {header()}
      {addAdapterButton()}
      <div css={tableHeader}>
        <div css={tableHeaderText}>{formatMessage('Name')} </div>
        <div css={tableHeaderText}>{formatMessage('Type')} </div>
      </div>
      {adapters?.map((p, index) => {
        return (
          <div key={index} css={tableRow}>
            <div css={tableItem} title={p.name}>
              {p.name}
            </div>
            <div css={tableItem} title={p.type}>
              {p.type}
            </div>
            <IconButton
              ariaLabel="Delete"
              iconProps={{ iconName: 'Delete' }}
              title="Delete"
              onClick={() => {
                setSettings(rootBotProjectId, {
                  ...settings,
                  adapters: adapters.filter((a) => a.key !== p.key),
                });
              }}
            />
          </div>
        );
      })}
      <AdapterModal
        handleSettings={(data) =>
          setSettings(rootBotProjectId, { ...settings, adapters: adapters == null ? [data] : [...adapters, data] })
        }
        isOpen={isModalOpen}
        title={formatMessage('Add adapter')}
        onClose={() => {
          showModal(false);
        }}
      />
    </CollapsableWrapper>
  );
};
