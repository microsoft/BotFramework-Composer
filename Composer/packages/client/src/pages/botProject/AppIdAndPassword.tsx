// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { jsx, css } from '@emotion/react';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import { Link } from '@fluentui/react/lib/Link';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { TextField } from '@bfc/ui-shared';

import { dispatcherState, settingsState } from '../../recoilModel';
import { mergePropertiesManagedByRootBot } from '../../recoilModel/dispatchers/utils/project';
import { rootBotProjectIdSelector } from '../../recoilModel/selectors/project';

import { inputFieldStyles, subtext } from './styles';
import { SettingTitle } from './shared/SettingTitle';
import { GetAppInfoFromPublishProfileDialog } from './GetAppInfoFromPublishProfileDialog';
// -------------------- Styles -------------------- //

const appIdAndPasswordStyle = css`
  display: flex;
  flex-direction: column;
`;

// -------------------- AppIdAndPassword -------------------- //

type AppIdAndPasswordProps = {
  projectId: string;
};

export const AppIdAndPassword: React.FC<AppIdAndPasswordProps> = (props) => {
  const { projectId } = props;
  const { MicrosoftAppId, MicrosoftAppPassword } = useRecoilValue(settingsState(projectId));
  const [localMicrosoftAppId, setLocalMicrosoftAppId] = useState<string>('');
  const [localMicrosoftAppPassword, setLocalMicrosoftAppPassword] = useState<string>('');
  const { setSettings } = useRecoilValue(dispatcherState);
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector) || '';
  const settings = useRecoilValue(settingsState(projectId));
  const mergedSettings = mergePropertiesManagedByRootBot(projectId, rootBotProjectId, settings);
  const [showImportDialog, setShowImportDialog] = useState(false);

  useEffect(() => {
    setLocalMicrosoftAppId(MicrosoftAppId ?? '');
    setLocalMicrosoftAppPassword(MicrosoftAppPassword ?? '');
  }, [projectId]);

  const handleAppIdOnChange = (e, value) => {
    setLocalMicrosoftAppId(value);
  };

  const handleAppPasswordOnChange = (e, value) => {
    setLocalMicrosoftAppPassword(value);
  };

  const handleAppPasswordOnBlur = useCallback(() => {
    setSettings(projectId, {
      ...mergedSettings,
      MicrosoftAppPassword: localMicrosoftAppPassword,
    });
  }, [projectId, mergedSettings, localMicrosoftAppPassword]);

  const handleAppIdOnBlur = useCallback(() => {
    setSettings(projectId, {
      ...mergedSettings,
      MicrosoftAppId: localMicrosoftAppId,
    });
  }, [projectId, mergedSettings, localMicrosoftAppId]);

  const handleAddFromProfile = (appId: string, appPassword: string) => {
    setLocalMicrosoftAppId(appId);
    setLocalMicrosoftAppPassword(appPassword);
    setSettings(projectId, {
      ...mergedSettings,
      MicrosoftAppId: appId,
      MicrosoftAppPassword: appPassword,
    });
  };

  return (
    <Fragment>
      <SettingTitle>{formatMessage('Microsoft App ID')}</SettingTitle>
      <div css={subtext}>
        {formatMessage.rich(
          'An App ID is used for communication between your bot and skills, services, websites or applications. Use an existing App ID or automatically generate an App ID when creating a publishing profile for this bot. <a>Learn more</a>',
          {
            a: ({ children }) => (
              <Link
                key="app-id-settings-page"
                aria-label={formatMessage('Learn more about App ID')}
                href={'https://aka.ms/composer-appid-learnmore'}
                target="_blank"
              >
                {children}
              </Link>
            ),
          }
        )}
      </div>
      <div css={appIdAndPasswordStyle}>
        <TextField
          data-testid={'MicrosoftAppId'}
          label={formatMessage('Microsoft App Id')}
          placeholder={formatMessage('Type App Id')}
          styles={inputFieldStyles}
          tooltip={formatMessage('Microsoft App Id')}
          value={localMicrosoftAppId}
          onBlur={handleAppIdOnBlur}
          onChange={handleAppIdOnChange}
        />
        <TextField
          data-testid={'MicrosoftPassword'}
          label={formatMessage('Microsoft App Password')}
          placeholder={formatMessage('Type App Password')}
          styles={inputFieldStyles}
          tooltip={formatMessage('Microsoft App Password')}
          value={localMicrosoftAppPassword}
          onBlur={handleAppPasswordOnBlur}
          onChange={handleAppPasswordOnChange}
        />
        <PrimaryButton
          styles={{ root: { width: '230px', marginTop: '15px' } }}
          text={formatMessage('Retrieve App ID')}
          onClick={() => {
            setShowImportDialog(true);
          }}
        />
      </div>
      {showImportDialog && (
        <GetAppInfoFromPublishProfileDialog
          hidden={!showImportDialog}
          projectId={projectId}
          onCancel={() => {
            setShowImportDialog(false);
          }}
          onOK={(info) => {
            setShowImportDialog(false);
            handleAddFromProfile(info.appId, info.appPassword || '');
          }}
        />
      )}
    </Fragment>
  );
};
