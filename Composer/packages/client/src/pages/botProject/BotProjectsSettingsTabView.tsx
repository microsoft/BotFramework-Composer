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

import { BotSkillConfiguration } from './BotSkillConfiguration';
import { BotProjectInfo } from './BotProjectInfo';
import { AppIdAndPassword } from './AppIdAndPassword';
import { ExternalService } from './ExternalService';
import { BotLanguage } from './BotLanguage';
import { RuntimeSettings } from './RuntimeSettings';
import AdapterSection from './adapters/AdapterSection';

// -------------------- Styles -------------------- //

const container = css`
  display: flex;
  flex-direction: column;
  max-width: 1000px;
  height: 100%;
`;

const idsInTab: Record<PivotItemKey, string[]> = {
  Basics: ['runtimeSettings'],
  LuisQna: ['luisKey', 'qnaKey'],
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

// -------------------- BotProjectSettingsTabView -------------------- //

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
        <PivotItem data-testid="overviewTab" headerText={formatMessage('Overview')} itemKey={PivotItemKey.Basics}>
          <BotProjectInfo isRootBot={isRootBot} projectId={projectId} />
          <RuntimeSettings projectId={projectId} scrollToSectionId={scrollToSectionId} />
        </PivotItem>
        <PivotItem
          data-testid="developmentResourcesTab"
          headerText={formatMessage('Development Resources')}
          itemKey={PivotItemKey.LuisQna}
        >
          <ExternalService projectId={projectId} scrollToSectionId={scrollToSectionId} />
          <AppIdAndPassword projectId={projectId} />
        </PivotItem>
        <PivotItem
          data-testid="connectionsTab"
          headerText={formatMessage('Connections')}
          itemKey={PivotItemKey.Connections}
        >
          {isRootBot && <AdapterSection projectId={projectId} scrollToSectionId={scrollToSectionId} />}
        </PivotItem>
        <PivotItem
          data-testid="skillsTab"
          headerText={formatMessage('Skill Configuration')}
          itemKey={PivotItemKey.SkillConfig}
        >
          {isRootBot && <BotSkillConfiguration projectId={projectId} />}
        </PivotItem>
        <PivotItem
          data-testid="localizationTab"
          headerText={formatMessage('localization')}
          itemKey={PivotItemKey.Language}
        >
          <BotLanguage projectId={projectId} />
        </PivotItem>
      </Pivot>
    </div>
  );
};

export default BotProjectSettingsTabView;
