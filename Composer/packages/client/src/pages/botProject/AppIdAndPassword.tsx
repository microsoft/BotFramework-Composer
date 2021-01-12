// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useState, useEffect, useCallback } from 'react';
import { jsx, css } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import formatMessage from 'format-message';
import { mergeStyleSets } from '@uifabric/styling';

import { dispatcherState, settingsState } from '../../recoilModel';
import { CollapsableWrapper } from '../../components/CollapsableWrapper';
import { mergePropertiesManagedByRootBot } from '../../recoilModel/dispatchers/utils/project';
import { rootBotProjectIdSelector } from '../../recoilModel/selectors/project';

import { titleStyle, onRenderLabel } from './common';
// -------------------- Styles -------------------- //

const appIdAndPasswordStyle = css`
  display: flex;
  flex-direction: column;
`;

const customError = {
  root: {
    selectors: {
      'p > span': {
        width: '100%',
      },
    },
  },
};

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
    <CollapsableWrapper title={formatMessage('App Id / Password')} titleStyle={titleStyle}>
      <div css={appIdAndPasswordStyle}>
        <TextField
          aria-label={formatMessage('Microsoft App Id')}
          data-testid={'MicrosoftAppId'}
          label={formatMessage('Microsoft App Id')}
          placeholder={formatMessage('Enter Microsoft App Id')}
          styles={customError}
          value={localMicrosoftAppId}
          onBlur={handleAppIdOnBlur}
          onChange={handleAppIdOnChange}
          onRenderLabel={onRenderLabel}
        />
        <TextField
          aria-label={formatMessage('Microsoft App Password')}
          data-testid={'MicrosoftPassword'}
          label={formatMessage('Microsoft App Password')}
          placeholder={formatMessage('Enter Microsoft App Password')}
          styles={mergeStyleSets({ root: { marginTop: 15 } }, customError)}
          value={localMicrosoftAppPassword}
          onBlur={handleAppPasswordOnBlur}
          onChange={handleAppPasswordOnChange}
          onRenderLabel={onRenderLabel}
        />
      </div>
    </CollapsableWrapper>
  );
};
