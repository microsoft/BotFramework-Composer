// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React from 'react';
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';

import { CollapsableWrapper } from '../../../components/CollapsableWrapper';
import { rootBotProjectIdSelector } from '../../../recoilModel/selectors/project';
import { dispatcherState, settingsState } from '../../../recoilModel';
import { titleStyle, sectionHeader, tableRow, tableItem, tableHeader, tableHeaderText } from '../common';

// -------------------- SkillHostEndPoint -------------------- //

const header = () => (
  <div css={sectionHeader}>
    {formatMessage('Adapters are installed by the package manager. Add adapters to connect your bot to channels.')}
  </div>
);

const addAdapterButton = (setSettings) => (
  <ActionButton iconProps={{ iconName: 'Add' }}>{formatMessage('Add adapter')}</ActionButton>
);

export const Adapters: React.FC = () => {
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector) ?? '';
  const { setSettings } = useRecoilValue(dispatcherState);
  const { adapters } = useRecoilValue(settingsState(rootBotProjectId));

  return (
    <CollapsableWrapper title={formatMessage('Adapters')} titleStyle={titleStyle}>
      {header()}
      {addAdapterButton(setSettings)}
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
          </div>
        );
      })}
    </CollapsableWrapper>
  );
};
