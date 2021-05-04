// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import React, { useMemo, useState, Suspense } from 'react';
import formatMessage from 'format-message';
import { RouteComponentProps } from '@reach/router';
import { JsonEditor } from '@bfc/code-editor';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { DialogSetting } from '@bfc/shared';
import { defaultToolbarButtonStyles } from '@bfc/ui-shared';

import { LoadingSpinner } from '../../components/LoadingSpinner';
import { INavTreeItem } from '../../components/NavTree';
import { Page } from '../../components/Page';
import { dispatcherState } from '../../recoilModel';
import { settingsState, userSettingsState } from '../../recoilModel/atoms';
import { localBotsDataSelector, rootBotProjectIdSelector } from '../../recoilModel/selectors/project';
import { createBotSettingUrl, navigateTo } from '../../utils/navigation';
import { mergePropertiesManagedByRootBot } from '../../recoilModel/dispatchers/utils/project';

import { openDeleteBotModal } from './DeleteBotButton';
import { BotProjectSettingsTabView } from './BotProjectsSettingsTabView';

// -------------------- Styles -------------------- //

const header = css`
  padding: 5px 20px;
  display: flex;
  justify-content: space-between;
  label: PageHeader;
  border-bottom: 1px solid silver;
`;

const container = css`
  display: flex;
  flex-direction: column;
  max-width: 1000px;
  height: 100%;
`;

// -------------------- BotProjectSettings -------------------- //

const BotProjectSettings: React.FC<RouteComponentProps<{ projectId: string; skillId: string }>> = (props) => {
  const { projectId = '', skillId } = props;
  const botProjects = useRecoilValue(localBotsDataSelector);
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector);
  const userSettings = useRecoilValue(userSettingsState);
  const currentProjectId = skillId ?? projectId;
  const botProject = botProjects.find((b) => b.projectId === currentProjectId);
  const { deleteBot } = useRecoilValue(dispatcherState);

  const settings = useRecoilValue(settingsState(currentProjectId));
  const mergedSettings = mergePropertiesManagedByRootBot(currentProjectId, rootBotProjectId, settings);

  const [isAdvancedSettingsEnabled, setAdvancedSettingsEnabled] = useState<boolean>(false);

  const { setSettings } = useRecoilValue(dispatcherState);

  const toolbarItems = useMemo(() => {
    return [
      {
        text: formatMessage('Delete bot'),
        type: 'action',
        buttonProps: {
          iconProps: { iconName: 'Trash' },
          onClick: () => {
            openDeleteBotModal(async () => {
              await deleteBot(projectId);
              navigateTo('home');
            });
          },
          styles: defaultToolbarButtonStyles,
        },
        align: 'left',
      },
    ];
  }, [projectId, rootBotProjectId]);

  const navLinks: INavTreeItem[] = useMemo(() => {
    const localBotProjects = botProjects.filter((b) => !b.isRemote);
    const newbotProjectLinks: INavTreeItem[] = localBotProjects.map((b) => {
      return {
        id: b.projectId,
        name: `${b.name} ${b.isRootBot ? formatMessage('(root)') : ''}`,
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
      "Review and configure your bot's resources, and add new connections such as speech, Microsoft Teams and more."
    );
  };

  const renderJsonToggle = (): JSX.Element => {
    return (
      <Toggle
        inlineLabel
        checked={isAdvancedSettingsEnabled}
        className={'advancedSettingsView'}
        defaultChecked={false}
        label={formatMessage('Advanced Settings View (json)')}
        styles={{ label: { fontSize: '12px', marginLeft: '8px' } }}
        onChange={() => {
          setAdvancedSettingsEnabled(!isAdvancedSettingsEnabled);
        }}
      />
    );
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
      title={formatMessage('Configure your bot')}
      toolbarItems={toolbarItems}
      onRenderHeaderContent={renderJsonToggle}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <div css={container}>
          {isAdvancedSettingsEnabled ? (
            <JsonEditor
              key={'settingsjson'}
              editorSettings={userSettings.codeEditor}
              id={currentProjectId}
              value={mergedSettings}
              onChange={handleChange}
            />
          ) : (
            <BotProjectSettingsTabView projectId={currentProjectId} scrollToSectionId={props.location?.hash} />
          )}
        </div>
      </Suspense>
    </Page>
  );
};

export default BotProjectSettings;
