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

import { BotProjectInfo } from './BotProjectInfo';
import { AppIdAndPassword } from './AppIdAndPassword';
import { ExternalService } from './ExternalService';
import { BotLanguage } from './BotLanguage';
import { RuntimeSettings } from './RuntimeSettings';
import AdapterSection from './adapters/AdapterSection';
import { SkillHostEndPoint } from './SkillHostEndPoint';
import { AllowedCallers } from './AllowedCallers';
import { tabContentContainer } from './styles';

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
  const isPVABot = usePVACheck(projectId);

  useEffect(() => {
    if (scrollToSectionId) {
      const htmlIdTagName = scrollToSectionId.replace('#', '');
      if (idsInTab[htmlIdTagName]) {
        setSelectedKey(PivotItemKey[htmlIdTagName]);
      } else {
        for (const key in PivotItemKey) {
          if (idsInTab[key].includes(htmlIdTagName)) {
            setSelectedKey(key as PivotItemKey);
          }
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
        <PivotItem data-testid="overviewTab" headerText={formatMessage('Overview')} itemKey={PivotItemKey.Basics}>
          <div css={tabContentContainer}>
            <BotProjectInfo isRootBot={isRootBot} projectId={projectId} />
            <RuntimeSettings projectId={projectId} scrollToSectionId={scrollToSectionId} />
          </div>
        </PivotItem>
        <PivotItem
          data-testid="developmentResourcesTab"
          headerButtonProps={isPVABot ? disabledPivotStyle : {}}
          headerText={formatMessage('Development resources')}
          itemKey={PivotItemKey.LuisQna}
          onRenderItemLink={() => {
            if (isPVABot) {
              return (
                <DisableFeatureToolTip isPVABot={isPVABot}>
                  {formatMessage('Development resources')}
                </DisableFeatureToolTip>
              );
            } else {
              return <Fragment>{formatMessage('Development resources')}</Fragment>;
            }
          }}
        >
          <div css={tabContentContainer}>
            <ExternalService projectId={projectId} scrollToSectionId={scrollToSectionId} />
            <AppIdAndPassword projectId={projectId} />
          </div>
        </PivotItem>
        {isRootBot && (
          <PivotItem
            data-testid="connectionsTab"
            headerButtonProps={isPVABot ? disabledPivotStyle : {}}
            headerText={formatMessage('Connections')}
            itemKey={PivotItemKey.Connections}
            onRenderItemLink={() => {
              if (isPVABot) {
                return (
                  <DisableFeatureToolTip isPVABot={isPVABot}>{formatMessage('Connections')}</DisableFeatureToolTip>
                );
              } else {
                return <Fragment>{formatMessage('Connections')}</Fragment>;
              }
            }}
          >
            <div css={tabContentContainer}>
              <AdapterSection projectId={projectId} scrollToSectionId={scrollToSectionId} />
            </div>
          </PivotItem>
        )}
        <PivotItem
          data-testid="skillsTab"
          headerButtonProps={isPVABot ? disabledPivotStyle : {}}
          itemKey={PivotItemKey.SkillConfig}
          onRenderItemLink={() => {
            if (isPVABot) {
              return (
                <DisableFeatureToolTip isPVABot={isPVABot}>
                  {formatMessage('Skill configuration')}
                </DisableFeatureToolTip>
              );
            } else {
              return <Fragment>{formatMessage('Skill configuration')}</Fragment>;
            }
          }}
        >
          <div css={tabContentContainer}>
            {isRootBot && <SkillHostEndPoint projectId={projectId} />}
            <AllowedCallers projectId={projectId} />
          </div>
        </PivotItem>
        <PivotItem
          data-testid="localizationTab"
          headerText={formatMessage('Localization')}
          itemKey={PivotItemKey.Language}
        >
          <div css={tabContentContainer}>
            <BotLanguage projectId={projectId} />
          </div>
        </PivotItem>
      </Pivot>
    </div>
  );
};

export default BotProjectSettingsTabView;
