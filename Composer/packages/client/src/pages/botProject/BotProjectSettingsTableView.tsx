// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import React, { useMemo } from 'react';
import formatMessage from 'format-message';
import { RouteComponentProps } from '@reach/router';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { Button } from 'office-ui-fabric-react/lib/Button';
import { Text } from 'office-ui-fabric-react/lib/Text';

import { OpenConfirmModal } from '../../components/Modal/ConfirmDialog';
import { navigateTo } from '../../utils/navigation';
import { dispatcherState } from '../../recoilModel';
import { botProjectSpaceSelector } from '../../recoilModel/selectors/project';

import { SkillHostEndPoint } from './SkillHostEndPoint';
import { AppIdAndPassword } from './AppIdAndPassword';
import { ExternalService } from './ExternalService';
import { BotLanguage } from './BotLanguage';
import { RuntimeSettings } from './RuntimeSettings';
import { PublishTargets } from './PublishTargets';
import { container, deleteBotText, deleteBotButton, marginBottom } from './styles';

type BotProjectSettingsTableViewProps = {
  projectId?: string;
  hasSkills: boolean;
} & RouteComponentProps<{}>;

export const BotProjectSettingsTableView: React.FC<BotProjectSettingsTableViewProps> = (props) => {
  const { projectId = '', hasSkills = false } = props;

  const { deleteBot } = useRecoilValue(dispatcherState);
  const botProjectsMetaData = useRecoilValue(botProjectSpaceSelector);
  const botProject = botProjectsMetaData.find((b) => b.projectId === projectId);
  const isRootBot = !!botProject?.isRootBot;

  const DeleteBotButton = useMemo(() => {
    const openDeleteBotModal = async () => {
      const boldWarningText = formatMessage(
        'Warning: the action you are about to take cannot be undone. Going further will delete this bot and any related files in the bot project folder.'
      );
      const warningText = formatMessage('External resources will not be changed.');
      const title = formatMessage('Delete Bot');
      const checkboxLabel = formatMessage('I want to delete this bot');
      const settings = {
        onRenderContent: () => {
          return (
            <div
              style={{
                background: '#ffddcc',
                display: 'flex',
                flexDirection: 'row',
                marginBottom: '24px',
              }}
            >
              <FontIcon
                iconName="Warning12"
                style={{
                  color: '#DD4400',
                  fontSize: 36,
                  padding: '32px',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Text
                  block
                  style={{
                    fontWeight: 'bold',
                    marginTop: '24px',
                    marginRight: '24px',
                    marginBottom: '24px',
                  }}
                >
                  {boldWarningText}
                </Text>
                <Text
                  block
                  style={{
                    marginRight: '24px',
                    marginBottom: '24px',
                  }}
                >
                  {warningText}
                </Text>
              </div>
            </div>
          );
        },
        disabled: true,
        checkboxLabel,
        confirmBtnText: formatMessage('Delete'),
      };
      const res = await OpenConfirmModal(title, null, settings);
      if (res) {
        await deleteBot(projectId);
        navigateTo('home');
      }
    };
    return (
      <div css={marginBottom}>
        <div css={deleteBotText}> {formatMessage('Delete this bot')}</div>
        <Button styles={deleteBotButton} onClick={openDeleteBotModal}>
          {formatMessage('Delete')}
        </Button>
      </div>
    );
  }, [projectId]);

  return (
    <div css={container}>
      {isRootBot && <SkillHostEndPoint projectId={projectId} />}
      <AppIdAndPassword projectId={projectId} required={hasSkills} />
      <ExternalService projectId={projectId} />
      <BotLanguage projectId={projectId} />
      <RuntimeSettings projectId={projectId} />
      <PublishTargets projectId={projectId} />
      {DeleteBotButton}
    </div>
  );
};

export default BotProjectSettingsTableView;
