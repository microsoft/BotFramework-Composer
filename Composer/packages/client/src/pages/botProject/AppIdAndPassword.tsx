// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useState, useEffect, useCallback } from 'react';
import { jsx, css } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import formatMessage from 'format-message';
import { mergeStyleSets } from '@uifabric/styling';
import { FontSizes } from 'office-ui-fabric-react/lib/Styling';
import { SharedColors } from '@uifabric/fluent-theme';

import { dispatcherState, settingsState } from '../../recoilModel';
import { CollapsableWrapper } from '../../components/CollapsableWrapper';
import { mergePropertiesManagedByRootBot } from '../../recoilModel/dispatchers/utils/project';
import { rootBotProjectIdSelector } from '../../recoilModel/selectors/project';

import { title } from './styles';
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
    <CollapsableWrapper title={formatMessage('App Id / Password')} titleStyle={title}>
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
