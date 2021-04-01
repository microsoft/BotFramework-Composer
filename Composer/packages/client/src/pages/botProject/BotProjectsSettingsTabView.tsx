// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/components/Pivot';
import formatMessage from 'format-message';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';

import { localBotsDataSelector } from '../../recoilModel/selectors/project';
import { useFeatureFlag } from '../../utils/hooks';

import { BotProjectInfo } from './BotProjectInfo';
import { SkillHostEndPoint } from './SkillHostEndPoint';
import { AppIdAndPassword } from './AppIdAndPassword';
import { ExternalService } from './ExternalService';
import { BotLanguage } from './BotLanguage';
import { RuntimeSettings } from './RuntimeSettings';
import { PublishTargets } from './PublishTargets';
import { DeleteBotButton } from './DeleteBotButton';
import AdapterSection from './adapters/AdapterSection';
import { SkillConfiguration } from './skill-configuration';

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

export const BotProjectSettingsTabView: React.FC<RouteComponentProps<{
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
      <Pivot>
        <PivotItem headerText={formatMessage('Basics')}>
          <BotProjectInfo projectId={projectId} />
          <AppIdAndPassword projectId={projectId} />
          <RuntimeSettings projectId={projectId} scrollToSectionId={scrollToSectionId} />
        </PivotItem>
        <PivotItem headerText={formatMessage('LUIS and QnA')}>
          <ExternalService projectId={projectId} scrollToSectionId={scrollToSectionId} />
        </PivotItem>
        <PivotItem headerText={formatMessage('Connections')}>
          <div css={publishTargetsWrap(!isRootBot)}>
            <PublishTargets projectId={projectId} scrollToSectionId={scrollToSectionId} />
            {isRootBot && useAdapters && <AdapterSection projectId={projectId} scrollToSectionId={scrollToSectionId} />}
          </div>
        </PivotItem>
        <PivotItem headerText={formatMessage('Skill Configuration')}>
          <SkillConfiguration projectId={projectId} />
        </PivotItem>
        <PivotItem headerText={formatMessage('Language')}>
          <BotLanguage projectId={projectId} />
        </PivotItem>
      </Pivot>
    </div>
  );
};

export default BotProjectSettingsTabView;
