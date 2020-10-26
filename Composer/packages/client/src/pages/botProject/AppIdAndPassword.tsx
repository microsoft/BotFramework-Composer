// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useState, useEffect } from 'react';
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import { TextField, ITextFieldProps } from 'office-ui-fabric-react/lib/TextField';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import formatMessage from 'format-message';
import { mergeStyleSets } from '@uifabric/styling';

import { dispatcherState, settingsState } from '../../recoilModel';
import { CollapsableWrapper } from '../../components/CollapsableWrapper';

import {
  labelContainer,
  customerLabel,
  unknownIconStyle,
  errorContainer,
  errorIcon,
  errorTextStyle,
  appIdAndPasswordStyle,
  customError,
  titleStyle,
} from './styles';

type AppIdAndPasswordProps = {
  projectId: string;
  required: boolean;
};

const onRenderLabel = (props: ITextFieldProps | undefined) => {
  return (
    <div css={labelContainer}>
      <div css={customerLabel}> {props?.label} </div>
      <TooltipHost content={props?.label}>
        <Icon iconName={'Unknown'} styles={unknownIconStyle(props?.required)} />
      </TooltipHost>
    </div>
  );
};

const errorElement = (errorText: string) => {
  if (!errorText) return '';
  return (
    <div css={errorContainer}>
      <Icon iconName={'ErrorBadge'} styles={errorIcon} />
      <div css={errorTextStyle}>{errorText}</div>
    </div>
  );
};

export const AppIdAndPassword: React.FC<AppIdAndPasswordProps> = (props) => {
  const { projectId, required } = props;
  const [microsoftAppIdErrorMsg, setMicrosoftAppIdErrorMsg] = useState<string>('');
  const [microsoftPasswordErrorMsg, setMicrosoftPasswordErrorMsg] = useState<string>('');
  const { MicrosoftAppId, MicrosoftAppPassword } = useRecoilValue(settingsState(projectId));
  const [localMicrosoftAppId, setLocalMicrosoftAppId] = useState<string>(MicrosoftAppId ?? '');
  const [localMicrosoftAppPassword, setLocalMicrosoftAppPassword] = useState<string>(MicrosoftAppPassword ?? '');
  const { setSettings } = useRecoilValue(dispatcherState);
  const settings = useRecoilValue(settingsState(projectId));
  useEffect(() => {
    setMicrosoftAppIdErrorMsg('');
    setMicrosoftPasswordErrorMsg('');
  }, [projectId]);

  const handleMicrosoftAppIdOnBlur = () => {
    if (!localMicrosoftAppId) {
      setMicrosoftAppIdErrorMsg(formatMessage('Microsoft App Id is required for this bot to call skills'));
    }
  };

  const handleMicrosoftAppPasswordOnBlur = () => {
    if (!localMicrosoftAppPassword) {
      setMicrosoftPasswordErrorMsg(formatMessage('Microsoft App Password is required for this bot too call skills'));
    }
  };

  return (
    <CollapsableWrapper title={formatMessage('App Id / Password')} titleStyle={titleStyle}>
      <div css={appIdAndPasswordStyle}>
        <TextField
          aria-labelledby={'Microsoft AppId'}
          errorMessage={required ? errorElement(microsoftAppIdErrorMsg) : ''}
          label={formatMessage('Microsoft App Id')}
          placeholder={'Enter Microsoft App Id'}
          required={required}
          styles={customError}
          value={localMicrosoftAppId}
          onBlur={handleMicrosoftAppIdOnBlur}
          onChange={async (e, value) => {
            await setSettings(projectId, {
              ...settings,
              MicrosoftAppId: value,
            });
            if (value) {
              setMicrosoftAppIdErrorMsg('');
              setLocalMicrosoftAppId(value);
            } else {
              setMicrosoftAppIdErrorMsg(formatMessage('Microsoft App Id is required for this bot to call skills'));
              setLocalMicrosoftAppId('');
            }
          }}
          onRenderLabel={onRenderLabel}
        />
        <TextField
          aria-labelledby={'Microsoft Password'}
          errorMessage={required ? errorElement(microsoftPasswordErrorMsg) : ''}
          label={formatMessage('Microsoft App Password')}
          placeholder={'Enter Microsoft App Password'}
          required={required}
          styles={mergeStyleSets({ root: { marginTop: 15 } }, customError)}
          value={MicrosoftAppPassword}
          onBlur={handleMicrosoftAppPasswordOnBlur}
          onChange={async (e, value) => {
            await setSettings(projectId, {
              ...settings,
              MicrosoftAppPassword: value,
            });
            if (value) {
              setMicrosoftPasswordErrorMsg('');
              setLocalMicrosoftAppPassword(value);
            } else {
              setMicrosoftPasswordErrorMsg(
                formatMessage('Microsoft App Password is required for this bot too call skills')
              );
              setLocalMicrosoftAppPassword('');
            }
          }}
          onRenderLabel={onRenderLabel}
        />
      </div>
    </CollapsableWrapper>
  );
};
