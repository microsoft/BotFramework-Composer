// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/components/Pivot';
import formatMessage from 'format-message';

import { localBotsDataSelector } from '../../recoilModel/selectors/project';

import { SkillHostEndPoint } from './SkillHostEndPoint';
import { BotProjectInfo } from './BotProjectInfo';
import { AppIdAndPassword } from './AppIdAndPassword';
import { ExternalService } from './ExternalService';
import { BotLanguage } from './BotLanguage';
import { RuntimeSettings } from './RuntimeSettings';
import { PublishTargets } from './PublishTargets';
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

const idsInTab: Record<PivotItemKey, string[]> = {
  Basics: ['runtimeSettings'],
  LuisQna: [],
  Connections: ['connections', 'addNewPublishProfile'],
  SkillConfig: [],
  Language: [],
};

enum PivotItemKey {
  Basics = 'Basics',
  LuisQna = 'LuisQna',
  Connections = 'Connections',
  SkillConfig = 'SkillConfig',
  Language = 'Language',
}

// -------------------- BotProjectSettingsTableView -------------------- //

export const BotProjectSettingsTabView: React.FC<RouteComponentProps<{
  projectId: string;
  scrollToSectionId: string;
}>> = (props) => {
  const { projectId = '', scrollToSectionId = '' } = props;
  const botProjects = useRecoilValue(localBotsDataSelector);
  const botProject = botProjects.find((b) => b.projectId === projectId);
  const isRootBot = !!botProject?.isRootBot;
  const [selectedKey, setSelectedKey] = useState(PivotItemKey.Basics);

  useEffect(() => {
    if (scrollToSectionId) {
      const htmlIdTagName = scrollToSectionId.replace('#', '');
      for (const key in PivotItemKey) {
        if (idsInTab[key].includes(htmlIdTagName)) {
          setSelectedKey(key as PivotItemKey);
        }
      }
    }
  }, [scrollToSectionId]);

  return (
    <div css={container}>
      <Pivot
        selectedKey={String(selectedKey)}
        onLinkClick={(item) => {
          item?.props.itemKey && setSelectedKey(item.props.itemKey as PivotItemKey);
        }}
      >
        <PivotItem data-testid="basicsTab" headerText={formatMessage('Basics')} itemKey={PivotItemKey.Basics}>
          <BotProjectInfo projectId={projectId} />
          <AppIdAndPassword projectId={projectId} />
          <RuntimeSettings projectId={projectId} scrollToSectionId={scrollToSectionId} />
        </PivotItem>
        <PivotItem data-testid="luisQnaTab" headerText={formatMessage('LUIS and QnA')} itemKey={PivotItemKey.LuisQna}>
          <ExternalService projectId={projectId} scrollToSectionId={scrollToSectionId} />
        </PivotItem>
        <PivotItem
          data-testid="connectionsTab"
          headerText={formatMessage('Connections')}
          itemKey={PivotItemKey.Connections}
        >
          <div css={publishTargetsWrap(!isRootBot)}>
            <PublishTargets projectId={projectId} scrollToSectionId={scrollToSectionId} />
            {isRootBot && <AdapterSection projectId={projectId} scrollToSectionId={scrollToSectionId} />}
          </div>
        </PivotItem>
        <PivotItem
          data-testid="skillsTab"
          headerText={formatMessage('Skill Configuration')}
          itemKey={PivotItemKey.SkillConfig}
        >
          {isRootBot && <SkillHostEndPoint projectId={projectId} />}
        </PivotItem>
        <PivotItem data-testid="languageTab" headerText={formatMessage('Language')} itemKey={PivotItemKey.Language}>
          <BotLanguage projectId={projectId} />
        </PivotItem>
      </Pivot>
    </div>
  );
};

export default BotProjectSettingsTabView;
