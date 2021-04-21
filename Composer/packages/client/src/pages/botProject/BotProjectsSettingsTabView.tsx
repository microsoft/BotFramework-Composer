// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import React, { Fragment, useEffect, useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/components/Pivot';
import formatMessage from 'format-message';
import { IButtonProps } from 'office-ui-fabric-react/lib/Button';
import { NeutralColors } from '@uifabric/fluent-theme';

import { localBotsDataSelector } from '../../recoilModel/selectors/project';
import { DisableFeatureToolTip } from '../../components/DisableFeatureToolTip';
import { usePVACheck } from '../../hooks/usePVACheck';
import { navigateTo } from '../../utils/navigation';

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

const disabledPivotStyle: IButtonProps = {
  disabled: true,
  style: {
    pointerEvents: 'unset',
    cursor: 'not-allowed',
    color: `${NeutralColors.gray100}`,
  },
};

const idsInTab: Record<PivotItemKey, string[]> = {
  Basics: ['runtimeSettings'],
  Connections: ['connections'],
  LuisQna: ['luisKey', 'qnaKey', 'luisRegion'],
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
  const isPVABot = usePVACheck(projectId);

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
          if (item?.props.itemKey) {
            setSelectedKey(item.props.itemKey as PivotItemKey);
            navigateTo(`/bot/${projectId}/botProjectsSettings/#${item.props.itemKey}`);
          }
        }}
      >
        <PivotItem data-testid="basicsTab" headerText={formatMessage('Basics')} itemKey={PivotItemKey.Basics}>
          <BotProjectInfo projectId={projectId} />
          <AppIdAndPassword projectId={projectId} />
          <RuntimeSettings projectId={projectId} scrollToSectionId={scrollToSectionId} />
        </PivotItem>
        <PivotItem
          data-testid="luisQnaTab"
          headerButtonProps={isPVABot ? disabledPivotStyle : {}}
          headerText={formatMessage('LUIS and QnA')}
          itemKey={PivotItemKey.LuisQna}
          onRenderItemLink={() => {
            if (isPVABot) {
              return <DisableFeatureToolTip isPVABot={isPVABot}>{formatMessage('LUIS and QnA')}</DisableFeatureToolTip>;
            } else {
              return <Fragment>{formatMessage('LUIS and QnA')}</Fragment>;
            }
          }}
        >
          <ExternalService projectId={projectId} scrollToSectionId={scrollToSectionId} />
        </PivotItem>
        <PivotItem
          data-testid="connectionsTab"
          headerButtonProps={isPVABot ? disabledPivotStyle : {}}
          headerText={formatMessage('Connections')}
          itemKey={PivotItemKey.Connections}
          onRenderItemLink={() => {
            if (isPVABot) {
              return <DisableFeatureToolTip isPVABot={isPVABot}>{formatMessage('Connections')}</DisableFeatureToolTip>;
            } else {
              return <Fragment>{formatMessage('Connections')}</Fragment>;
            }
          }}
        >
          {isRootBot && <AdapterSection projectId={projectId} scrollToSectionId={scrollToSectionId} />}
        </PivotItem>
        <PivotItem
          data-testid="skillsTab"
          headerButtonProps={isPVABot ? disabledPivotStyle : {}}
          itemKey={PivotItemKey.SkillConfig}
          onRenderItemLink={() => {
            if (isPVABot) {
              return (
                <DisableFeatureToolTip isPVABot={isPVABot}>
                  {formatMessage('Skill Configuration')}
                </DisableFeatureToolTip>
              );
            } else {
              return <Fragment>{formatMessage('Skill Configuration')}</Fragment>;
            }
          }}
        >
          {isRootBot && <BotSkillConfiguration projectId={projectId} />}
        </PivotItem>
        <PivotItem data-testid="languageTab" headerText={formatMessage('Language')} itemKey={PivotItemKey.Language}>
          <BotLanguage projectId={projectId} />
        </PivotItem>
      </Pivot>
    </div>
  );
};

export default BotProjectSettingsTabView;
