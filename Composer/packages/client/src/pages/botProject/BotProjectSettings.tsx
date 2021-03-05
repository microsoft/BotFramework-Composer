// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import React, { useMemo, useState, Suspense, Fragment, useEffect } from 'react';
import formatMessage from 'format-message';
import { RouteComponentProps } from '@reach/router';
import { JsonEditor } from '@bfc/code-editor';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { TeachingBubble } from 'office-ui-fabric-react/lib/TeachingBubble';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { DialogSetting } from '@bfc/shared';
import { FontSizes, FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { NeutralColors } from '@uifabric/fluent-theme';
import { defaultToolbarButtonStyles, IToolbarItem } from '@bfc/ui-shared';

import TelemetryClient from '../../telemetry/TelemetryClient';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { INavTreeItem } from '../../components/NavTree';
import { GetStarted } from '../../components/GetStarted/GetStarted';
import { Page } from '../../components/Page';
import { dispatcherState } from '../../recoilModel';
import { settingsState, userSettingsState } from '../../recoilModel/atoms';
import { localBotsDataSelector, rootBotProjectIdSelector } from '../../recoilModel/selectors/project';
import { createBotSettingUrl, navigateTo } from '../../utils/navigation';
import { mergePropertiesManagedByRootBot } from '../../recoilModel/dispatchers/utils/project';
import { useFeatureFlag } from '../../utils/hooks';

import BotProjectSettingsTableView from './BotProjectSettingsTableView';

// -------------------- Styles -------------------- //

const header = css`
  padding: 5px 20px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  justify-content: space-between;
  label: PageHeader;
`;

const container = css`
  display: flex;
  flex-direction: column;
  max-width: 1000px;
  height: 100%;
`;

const botNameStyle = css`
  font-size: ${FontSizes.xLarge};
  font-weight: ${FontWeights.semibold};
  color: ${NeutralColors.black};
`;

const mainContentHeader = css`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
`;

// -------------------- BotProjectSettings -------------------- //

const BotProjectSettings: React.FC<RouteComponentProps<{ projectId: string; skillId: string }>> = (props) => {
  const { projectId = '', skillId } = props;
  const botProjects = useRecoilValue(localBotsDataSelector);
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector);
  const userSettings = useRecoilValue(userSettingsState);
  const currentProjectId = skillId ?? projectId;
  const botProject = botProjects.find((b) => b.projectId === currentProjectId);
  const newCreationFlowFlag = useFeatureFlag('NEW_CREATION_FLOW');
  const [showGetStarted, setShowGetStarted] = useState<boolean>(false);
  const [showTeachingBubble, setShowTeachingBubble] = useState<boolean>(true);
  const [toolbarItems, setToolbarItems] = useState<IToolbarItem[]>([]);

  const isRootBot = !!botProject?.isRootBot;
  const botName = botProject?.name;
  const settings = useRecoilValue(settingsState(currentProjectId));
  const mergedSettings = mergePropertiesManagedByRootBot(currentProjectId, rootBotProjectId, settings);

  const [isAdvancedSettingsEnabled, setAdvancedSettingsEnabled] = useState<boolean>(false);

  const { setSettings } = useRecoilValue(dispatcherState);

  const linkToPackageManager = `/bot/${rootBotProjectId}/plugin/package-manager/package-manager`;
  const linkToConnections = `/bot/${rootBotProjectId}/botProjectsSettings/#connections`;
  const linkToLGEditor = `/bot/${rootBotProjectId}/language-generation`;
  const linkToLUEditor = `/bot/${rootBotProjectId}/language-understanding`;
  const linkToDelete = `/bot/${rootBotProjectId}/botProjectsSettings/#deleteBot`;

  const buttonClick = (link) => {
    TelemetryClient.track('GettingStartedLinkClicked', { method: 'button', url: link });
    navigateTo(link);
  };

  const hideTeachingBubble = () => {
    setShowTeachingBubble(false);
  };
  const toggleGetStarted = (newvalue) => {
    hideTeachingBubble();
    setShowGetStarted(newvalue);
  };

  useEffect(() => {
    if (newCreationFlowFlag) {
      setToolbarItems([
        {
          text: formatMessage('Add a package'),
          type: 'action',
          buttonProps: {
            iconProps: { iconName: 'Package' },
            onClick: () => buttonClick(linkToPackageManager),
            styles: defaultToolbarButtonStyles,
          },
          align: 'left',
        },
        {
          text: formatMessage('Edit LG'),
          type: 'action',
          buttonProps: {
            iconProps: { iconName: 'Robot' },
            onClick: () => buttonClick(linkToLGEditor),
            styles: defaultToolbarButtonStyles,
          },
          align: 'left',
        },
        {
          text: formatMessage('Edit LU'),
          type: 'action',
          buttonProps: {
            iconProps: { iconName: 'People' },
            onClick: () => buttonClick(linkToLUEditor),
            styles: defaultToolbarButtonStyles,
          },
          align: 'left',
        },
        {
          text: formatMessage('Manage connections'),
          type: 'action',
          buttonProps: {
            iconProps: { iconName: 'PlugConnected' },
            onClick: () => buttonClick(linkToConnections),
            styles: defaultToolbarButtonStyles,
          },
          align: 'left',
        },
        {
          text: formatMessage('Delete bot'),
          type: 'action',
          buttonProps: {
            iconProps: { iconName: 'Trash' },
            onClick: () => buttonClick(linkToDelete),
            styles: defaultToolbarButtonStyles,
          },
          align: 'left',
        },
        {
          type: 'element',
          element: (
            <Fragment>
              <ActionButton
                iconProps={{ iconName: 'Rocket' }}
                id="rocketButton"
                onClick={() => toggleGetStarted(true)}
              />
              {showTeachingBubble && (
                <TeachingBubble
                  hasCloseButton
                  hasCondensedHeadline
                  headline={formatMessage('Get your bot up and running')}
                  target="#rocketButton"
                  onDismiss={hideTeachingBubble}
                >
                  {formatMessage(
                    'Explore next steps and find valuable references and learning resources to design, build, and publish your new bot using Composer.'
                  )}
                </TeachingBubble>
              )}
            </Fragment>
          ),
          align: 'right',
        },
      ]);
    }
  }, [showTeachingBubble]);

  useEffect(() => {
    if (props.location?.hash === '#getstarted') {
      setShowTeachingBubble(true);
    } else {
      setShowTeachingBubble(false);
    }
  }, []);

  const navLinks: INavTreeItem[] = useMemo(() => {
    const localBotProjects = botProjects.filter((b) => !b.isRemote);
    const newbotProjectLinks: INavTreeItem[] = localBotProjects.map((b) => {
      return {
        id: b.projectId,
        name: b.name,
        ariaLabel: formatMessage('bot'),
        url: createBotSettingUrl(rootBotProjectId ?? '', b.projectId),
        isRootBot: b.isRootBot,
      };
    });
    const rootBotIndex = localBotProjects.findIndex((link) => link.isRootBot);

    if (rootBotIndex > -1) {
      const rootBotLink = newbotProjectLinks.splice(rootBotIndex, 1)[0];
      newbotProjectLinks.splice(0, 0, rootBotLink);
    }
    return newbotProjectLinks;
  }, [botProjects]);

  const onRenderHeaderContent = () => {
    return formatMessage(
      'This Page contains detailed information about your bot. For security reasons, they are hidden by default. To test your bot or publish to Azure, you may need to provide these settings'
    );
  };

  const saveChangeResult = (result: DialogSetting) => {
    setSettings(currentProjectId, result);
  };

  const handleChange = (result: any) => {
    // prevent result was undefined, it will cause error
    if (result && typeof result === 'object') {
      saveChangeResult(result);
    }
  };

  if (!botProject) {
    navigateTo(`/bot/${rootBotProjectId}/botProjectsSettings`);
    return null;
  }

  return (
    <Page
      useDebugPane
      data-testid="BotProjectsSettings"
      headerStyle={header}
      mainRegionName={formatMessage('Bot projects settings list View')}
      navLinks={navLinks}
      navRegionName={formatMessage('Bot Projects Settings Navigation Pane')}
      pageMode={'botProjectsSettings'}
      shouldShowEditorError={false}
      title={formatMessage('Bot management and configurations')}
      toolbarItems={toolbarItems}
      onRenderHeaderContent={onRenderHeaderContent}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <GetStarted
          isOpen={showGetStarted}
          onDismiss={() => {
            toggleGetStarted(false);
          }}
        />
        <div css={container}>
          <div css={mainContentHeader}>
            <div css={botNameStyle}>
              {`${botName} (${isRootBot ? formatMessage('Root Bot') : formatMessage('Skill')})`}
            </div>
            <Toggle
              inlineLabel
              checked={isAdvancedSettingsEnabled}
              className={'advancedSettingsView'}
              defaultChecked={false}
              label={formatMessage('Advanced Settings View (json)')}
              onChange={() => setAdvancedSettingsEnabled(!isAdvancedSettingsEnabled)}
            />
          </div>
          {isAdvancedSettingsEnabled ? (
            <JsonEditor
              key={'settingsjson'}
              editorSettings={userSettings.codeEditor}
              id={currentProjectId}
              value={mergedSettings}
              onChange={handleChange}
            />
          ) : (
            <BotProjectSettingsTableView projectId={currentProjectId} scrollToSectionId={props.location?.hash} />
          )}
        </div>
      </Suspense>
    </Page>
  );
};

export default BotProjectSettings;
