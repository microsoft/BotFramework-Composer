// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import React from 'react';
import { RouteComponentProps } from '@reach/router';

import { localBotsDataSelector } from '../../recoilModel/selectors/project';
import { useFeatureFlag } from '../../utils/hooks';

import { SkillHostEndPoint } from './SkillHostEndPoint';
import { AppIdAndPassword } from './AppIdAndPassword';
import { ExternalService } from './ExternalService';
import { BotLanguage } from './BotLanguage';
import { RuntimeSettings } from './RuntimeSettings';
import { PublishTargets } from './PublishTargets';
import { DeleteBotButton } from './DeleteBotButton';
import AdapterSection from './adapters/AdapterSection';

// -------------------- Styles -------------------- //

const container = css`
  display: flex;
  flex-direction: column;
  max-width: 1000px;
  height: 100%;
`;

const publishTargetsWrap = (isLastComponent) => css`
  margin-bottom: ${isLastComponent ? '120px' : 0};
`;

// -------------------- BotProjectSettingsTableView -------------------- //

export const BotProjectSettingsTableView: React.FC<RouteComponentProps<{
  projectId: string;
  scrollToSectionId: string;
}>> = (props) => {
  const { projectId = '', scrollToSectionId = '' } = props;
  const botProjects = useRecoilValue(localBotsDataSelector);
  const botProject = botProjects.find((b) => b.projectId === projectId);
  const isRootBot = !!botProject?.isRootBot;
  const useAdapters = useFeatureFlag('NEW_CREATION_FLOW');

  return (
    <div css={container}>
      {isRootBot && <SkillHostEndPoint projectId={projectId} />}
      <AppIdAndPassword projectId={projectId} />
      <ExternalService projectId={projectId} scrollToSectionId={scrollToSectionId} />
      <BotLanguage projectId={projectId} />
      {isRootBot && useAdapters && <AdapterSection projectId={projectId} scrollToSectionId={scrollToSectionId} />}
      <RuntimeSettings projectId={projectId} scrollToSectionId={scrollToSectionId} />
      <div css={publishTargetsWrap(!isRootBot)}>
        <PublishTargets projectId={projectId} scrollToSectionId={scrollToSectionId} />
      </div>
      {isRootBot && <DeleteBotButton projectId={projectId} />}
    </div>
  );
};

export default BotProjectSettingsTableView;
