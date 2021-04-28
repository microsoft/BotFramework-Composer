// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { jsx, css } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import formatMessage from 'format-message';
import { FontSizes } from 'office-ui-fabric-react/lib/Styling';
import { SharedColors } from '@uifabric/fluent-theme';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';

import { dispatcherState, settingsState } from '../../recoilModel';
import { mergePropertiesManagedByRootBot } from '../../recoilModel/dispatchers/utils/project';
import { rootBotProjectIdSelector } from '../../recoilModel/selectors/project';

import { inputFieldStyles, subtext, title } from './styles';
import { GetAppInfoFromPublishProfileDialog } from './GetAppInfoFromPublishProfileDialog';
// -------------------- Styles -------------------- //

const labelContainer = css`
  display: flex;
  flex-direction: row;
`;

const customerLabel = css`
  font-size: ${FontSizes.small};
  margin-right: 5px;
`;

const unknownIconStyle = (required) => {
  return {
    root: {
      selectors: {
        '&::before': {
          content: required ? " '*'" : '',
          color: SharedColors.red10,
          paddingRight: 3,
        },
      },
    },
  };
};

const appIdAndPasswordStyle = css`
  display: flex;
  flex-direction: column;
`;

// -------------------- AppIdAndPassword -------------------- //

type AppIdAndPasswordProps = {
  projectId: string;
};

const onRenderLabel = (props) => {
  return (
    <div css={labelContainer}>
      <div css={customerLabel}> {props.label} </div>
      <TooltipHost content={props.label}>
        <Icon iconName="Unknown" styles={unknownIconStyle(props.required)} />
      </TooltipHost>
    </div>
  );
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

  return (
    <Fragment>
      <div css={title}>{formatMessage('Microsoft App ID')}</div>
      <div css={subtext}>
        {formatMessage.rich(
          'A Microsoft App ID is required for your local Azure resources. If you’ve created an App ID already, you can add here. If not, your App ID and Password will be created when you provision resources for this bot. To add and App ID and Password from a publishing profile you’ve created, click the button below. <a>Learn more.</a>',
          {
            a: ({ children }) => (
              <Link key="app-id-settings-page" href={'https://aka.ms/composer-appid-learnmore'} target="_blank">
                {children}
              </Link>
            ),
          }
        )}
      </div>
      <div css={appIdAndPasswordStyle}>
        <TextField
          ariaLabel={formatMessage('Microsoft App Id')}
          data-testid={'MicrosoftAppId'}
          label={formatMessage('Microsoft App Id')}
          placeholder={formatMessage('Enter Microsoft App Id')}
          styles={inputFieldStyles}
          value={localMicrosoftAppId}
          onBlur={handleAppIdOnBlur}
          onChange={handleAppIdOnChange}
          onRenderLabel={onRenderLabel}
        />
        <TextField
          ariaLabel={formatMessage('Microsoft App Password')}
          data-testid={'MicrosoftPassword'}
          label={formatMessage('Microsoft App Password')}
          placeholder={formatMessage('Enter Microsoft App Password')}
          styles={inputFieldStyles}
          value={localMicrosoftAppPassword}
          onBlur={handleAppPasswordOnBlur}
          onChange={handleAppPasswordOnChange}
          onRenderLabel={onRenderLabel}
        />
        <PrimaryButton
          styles={{ root: { width: '230px', marginTop: '15px' } }}
          text={formatMessage('Add from publishing profile')}
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
            setLocalMicrosoftAppId(info.appId);
            setLocalMicrosoftAppPassword(info.appPassword || '');
            setSettings(projectId, {
              ...mergedSettings,
              MicrosoftAppId: info.appId,
              MicrosoftAppPassword: info.appPassword,
            });
          }}
        />
      )}
    </Fragment>
  );
};
