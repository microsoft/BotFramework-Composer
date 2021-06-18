// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useEffect } from 'react';
import formatMessage from 'format-message';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { RouteComponentProps } from '@reach/router';
import { useRecoilValue } from 'recoil';

import { dispatcherState, botDisplayNameState, settingsState } from '../../../recoilModel';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { subtext, errorContainer, errorTextStyle, errorIcon, inputFieldStyles } from '../styles';

import { runtimeSettingsStyle } from './style';

type RuntimeType = 'path' | 'command';

export const RuntimeSettings: React.FC<RouteComponentProps<{ projectId: string }>> = (props) => {
  const { projectId = '' } = props;
  const botName = useRecoilValue(botDisplayNameState(projectId));
  const settings = useRecoilValue(settingsState(projectId));
  const { setRuntimeField } = useRecoilValue(dispatcherState);
  const [formDataErrors, setFormDataErrors] = useState({ command: '' });
  const [runtimeCommand, setRuntimeCommand] = useState(settings.runtime?.command ?? '');

  useEffect(() => {
    setRuntimeCommand(settings.runtime?.command ?? '');
    const errorMessage = formatMessage('This is a required field.');
    const errors = { command: '' };
    if (!settings.runtime?.command) {
      errors.command = errorMessage;
    }
    setFormDataErrors(errors);
  }, [settings, projectId]);

  const handleRuntimeSettingOnChange = (field: RuntimeType) => (e, newValue) => {
    let valid = true;
    let error = formatMessage('There was an error');
    if (newValue === '') {
      valid = false;
      error = formatMessage('This is a required field.');
    }

    if (field === 'command') {
      setRuntimeCommand(newValue);
    }

    if (valid) {
      setFormDataErrors({ ...formDataErrors, [field]: '' });
    } else {
      setFormDataErrors({ ...formDataErrors, [field]: error });
    }
  };

  const handleRuntimeSettingOnBlur = (field: RuntimeType) => {
    if (field === 'command') {
      setRuntimeField(projectId, field, runtimeCommand);
    }
  };

  const header = () => (
    <div css={subtext}>
      {formatMessage('Configure the command used by Composer to start your bot application when testing locally.')}
    </div>
  );

  const errorElement = (errorText: string) => {
    if (!errorText) return '';
    return (
      <span css={errorContainer}>
        <Icon iconName="ErrorBadge" styles={errorIcon} />
        <span css={errorTextStyle}>{errorText}</span>
      </span>
    );
  };

  return botName ? (
    <div css={runtimeSettingsStyle} id="runtimeSettings">
      {header()}
      <TextField
        required
        data-testid="runtimeCommand"
        disabled={!settings.runtime || !settings.runtime.customRuntime}
        errorMessage={errorElement(formDataErrors.command)}
        label={formatMessage('Start command')}
        styles={inputFieldStyles}
        value={runtimeCommand}
        onBlur={() => handleRuntimeSettingOnBlur('command')}
        onChange={handleRuntimeSettingOnChange('command')}
      />
    </div>
  ) : (
    <LoadingSpinner />
  );
};
