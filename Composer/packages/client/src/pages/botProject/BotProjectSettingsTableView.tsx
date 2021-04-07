// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import React from 'react';
import { RouteComponentProps } from '@reach/router';

import { localBotsDataSelector } from '../../recoilModel/selectors/project';

import { BotProjectInfo } from './BotProjectInfo';
import { SkillHostEndPoint } from './SkillHostEndPoint';
import { AppIdAndPassword } from './AppIdAndPassword';
import { ExternalService } from './ExternalService';
import { BotLanguage } from './BotLanguage';
import { RuntimeSettings } from './RuntimeSettings';
import { PublishTargets } from './PublishTargets';
import AdapterSection from './adapters/AdapterSection';
import { AllowedCallers } from './AllowedCallers';

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

  return (
    <div css={container}>
      <BotProjectInfo projectId={projectId} />
      {isRootBot && <SkillHostEndPoint projectId={projectId} />}
      <AppIdAndPassword projectId={projectId} />
      <ExternalService projectId={projectId} scrollToSectionId={scrollToSectionId} />
      <BotLanguage projectId={projectId} />
      {isRootBot && <AdapterSection projectId={projectId} scrollToSectionId={scrollToSectionId} />}
      <RuntimeSettings projectId={projectId} scrollToSectionId={scrollToSectionId} />
      <div css={publishTargetsWrap(!isRootBot)}>
        <PublishTargets projectId={projectId} scrollToSectionId={scrollToSectionId} />
      </div>
      <AllowedCallers projectId={projectId} />
    </div>
  );
};

export default BotProjectSettingsTableView;
