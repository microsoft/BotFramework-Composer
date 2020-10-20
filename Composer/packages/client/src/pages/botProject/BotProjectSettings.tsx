// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import React, { useMemo, useState, Suspense, useEffect } from 'react';
import formatMessage from 'format-message';
import { RouteComponentProps } from '@reach/router';
import { JsonEditor } from '@bfc/code-editor';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';

import { LoadingSpinner } from '../../components/LoadingSpinner';
import { INavTreeItem } from '../../components/NavTree';
import { Page } from '../../components/Page';
import { dispatcherState } from '../../recoilModel';
import { settingsState, userSettingsState, schemasState } from '../../recoilModel/atoms';
import { botProjectSpaceSelector } from '../../recoilModel/selectors/project';

import TableView from './table-view';
import { header, container, botNameStyle, mainContentHeader } from './styles';

interface BotProjectSettingsProps extends RouteComponentProps<{}> {
  projectId?: string;
  skillId?: string;
}

const BotProjectSettings: React.FC<BotProjectSettingsProps> = (props) => {
  const projectId = props.skillId || props.projectId || '';
  const botProjectsMetaData = useRecoilValue(botProjectSpaceSelector);
  const userSettings = useRecoilValue(userSettingsState);
  const schemas = useRecoilValue(schemasState(projectId));
  const botProject = botProjectsMetaData.find((b) => b.projectId === projectId);
  const isRootBot = botProject?.isRootBot;
  const botName = botProject?.name;
  const settings = useRecoilValue(settingsState(projectId));

  const [isAdvancedSettingsEnabled, setAdvancedSettings] = useState<boolean>(false);

  const { setSettings } = useRecoilValue(dispatcherState);

  useEffect(() => {
    setAdvancedSettings(false);
  }, [projectId]);

  const navLinks: INavTreeItem[] = useMemo(() => {
    const localBotProjects = botProjectsMetaData.filter((b) => !b.isRemote);
    const rootBotprojectId = botProjectsMetaData.find((b) => b.isRootBot)?.projectId;
    const newbotProjectLinks: INavTreeItem[] = localBotProjects.map((b) => {
      return {
        id: b.projectId,
        name: b.name,
        ariaLabel: formatMessage('bot'),
        url: b.isRootBot
          ? `/bot/${rootBotprojectId}/botProjectsSettings/root`
          : `/bot/${rootBotprojectId}/botProjectsSettings/skill/${b.projectId}`,
        isRootBot: b.isRootBot,
      };
    });
    const rootBotIndex = localBotProjects.findIndex((link) => link.isRootBot);

    if (rootBotIndex > -1) {
      const rootBotLink = newbotProjectLinks.splice(rootBotIndex, 1)[0];
      newbotProjectLinks.splice(0, 0, rootBotLink);
    }
    return newbotProjectLinks;
  }, [botProjectsMetaData]);
  const onRenderHeaderContent = () => {
    return formatMessage(
      'This Page contains detailed information about your bot. For security reasons, they are hidden by default. To test your bot or publish to Azure, you may need to provide these settings'
    );
  };

  const saveChangeResult = (result) => {
    try {
      setSettings(projectId, result);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err.message);
    }
  };

  const handleChange = (result: any) => {
    // prevent result was undefined, it will cause error
    if (result && typeof result === 'object') {
      saveChangeResult(result);
    }
  };

  return (
    <Page
      data-testid="BotProjectsSetting"
      headerStyle={header}
      mainRegionName={formatMessage('Bot projects settings list View')}
      navLinks={navLinks}
      navRegionName={formatMessage('Bot Projects Settings Navigation Pane')}
      title={formatMessage('Bot management and configurations.')}
      toolbarItems={[]}
      onRenderHeaderContent={onRenderHeaderContent}
    >
      <Suspense fallback={<LoadingSpinner />}>
        <div css={container}>
          <div css={mainContentHeader}>
            <div css={botNameStyle}> {`${botName} (${isRootBot ? 'Root Bot' : 'Skill'})`} </div>
            <Toggle
              checked={isAdvancedSettingsEnabled}
              className={'advancedSettingsView'}
              defaultChecked={false}
              offText={formatMessage('Advanced Settings View (json)')}
              onChange={() => setAdvancedSettings(!isAdvancedSettingsEnabled)}
              onText={formatMessage('Advanced Settings View (json)')}
            />
          </div>
          {isAdvancedSettingsEnabled && (
            <JsonEditor
              key={'settingsjson'}
              editorSettings={userSettings.codeEditor}
              id={projectId}
              schema={schemas.sdk.content}
              value={settings}
              onChange={handleChange}
            />
          )}
          {!isAdvancedSettingsEnabled && <TableView hasSkills={botProjectsMetaData.length > 1} projectId={projectId} />}
        </div>
      </Suspense>
    </Page>
  );
};

export default BotProjectSettings;
