// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { useState, useEffect } from 'react';
import { jsx, css } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import formatMessage from 'format-message';
import { mergeStyleSets } from '@uifabric/styling';
import { FontSizes, FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';

import { dispatcherState, settingsState } from '../../recoilModel';
import { CollapsableWrapper } from '../../components/CollapsableWrapper';

// -------------------- Styles -------------------- //

const titleStyle = css`
  font-size: ${FontSizes.medium};
  font-weight: ${FontWeights.semibold};
  margin-left: 22px;
  margin-top: 6px;
`;

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

const errorContainer = css`
  display: flex;
  width: 100%;
  height: 48px;
  line-height: 48px;
  background: #fed9cc;
  color: ${NeutralColors.black};
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

const errorIcon = {
  root: {
    color: '#A80000',
    marginRight: 8,
    paddingLeft: 12,
    fontSize: FontSizes.mediumPlus,
  },
};

const errorTextStyle = css`
  margin-bottom: 5px;
`;

// -------------------- AppIdAndPassword -------------------- //

type AppIdAndPasswordProps = {
  projectId: string;
  required: boolean;
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

const errorElement = (errorText: string) => {
  if (!errorText) return '';
  return (
    <div css={errorContainer} data-testid={'AppIdAndPasswordError'}>
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

  const handleAppIdOnChange = async (e, value) => {
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
  };

  const handleMicrosoftAppPasswordOnChange = async (e, value) => {
    await setSettings(projectId, {
      ...settings,
      MicrosoftAppPassword: value,
    });
    if (value) {
      setMicrosoftPasswordErrorMsg('');
      setLocalMicrosoftAppPassword(value);
    } else {
      setMicrosoftPasswordErrorMsg(formatMessage('Microsoft App Password is required for this bot too call skills'));
      setLocalMicrosoftAppPassword('');
    }
  };

  return (
    <CollapsableWrapper title={formatMessage('App Id / Password')} titleStyle={titleStyle}>
      <div css={appIdAndPasswordStyle}>
        <TextField
          aria-labelledby={'Microsoft App Id'}
          data-testid={'MicrosoftAppId'}
          errorMessage={required ? errorElement(microsoftAppIdErrorMsg) : ''}
          label={formatMessage('Microsoft App Id')}
          placeholder={'Enter Microsoft App Id'}
          required={required}
          styles={customError}
          value={localMicrosoftAppId}
          onBlur={handleMicrosoftAppIdOnBlur}
          onChange={handleAppIdOnChange}
          onRenderLabel={onRenderLabel}
        />
        <TextField
          aria-labelledby={'Microsoft Password'}
          data-testid={'MicrosoftPassword'}
          errorMessage={required ? errorElement(microsoftPasswordErrorMsg) : ''}
          label={formatMessage('Microsoft App Password')}
          placeholder={'Enter Microsoft App Password'}
          required={required}
          styles={mergeStyleSets({ root: { marginTop: 15 } }, customError)}
          value={MicrosoftAppPassword}
          onBlur={handleMicrosoftAppPasswordOnBlur}
          onChange={handleMicrosoftAppPasswordOnChange}
          onRenderLabel={onRenderLabel}
        />
      </div>
    </CollapsableWrapper>
  );
};
