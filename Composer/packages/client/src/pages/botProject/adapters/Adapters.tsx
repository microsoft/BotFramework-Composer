// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React from 'react';
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import { DialogSetting } from '@bfc/shared';

import { CollapsableWrapper } from '../../../components/CollapsableWrapper';
import { rootBotProjectIdSelector, enabledExtensionsSelector } from '../../../recoilModel/selectors';
import { dispatcherState, settingsState } from '../../../recoilModel';
import { titleStyle, sectionHeader, tableRow, tableItem, tableHeader, tableHeaderText } from '../common';

// -------------------- SkillHostEndPoint -------------------- //

const header = () => (
  <div css={sectionHeader}>
    {formatMessage('Adapters are installed by the package manager. Add adapters to connect your bot to channels.')}
  </div>
);
export const Adapters: React.FC = () => {
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector) ?? '';
  const extensions = useRecoilValue(enabledExtensionsSelector);
  const { setSettings } = useRecoilValue(dispatcherState);
  const settings = useRecoilValue(settingsState(rootBotProjectId));
  const { adapters } = settings;

  console.log(extensions);

  return (
    <CollapsableWrapper title={formatMessage('Adapters')} titleStyle={titleStyle}>
      {header()}
      <div css={tableHeader}>
        <div css={tableHeaderText}>{formatMessage('Name')} </div>
        <div css={tableHeaderText}>{formatMessage('Type')} </div>
      </div>
    </CollapsableWrapper>
  );
};
