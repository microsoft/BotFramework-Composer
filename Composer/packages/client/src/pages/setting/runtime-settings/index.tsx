// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useContext, useEffect } from 'react';
import formatMessage from 'format-message';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { RouteComponentProps } from '@reach/router';

import { StoreContext } from '../../../store';

import { EjectModal } from './ejectModal';
import {
  breathingSpace,
  runtimeSettingsStyle,
  runtimeControls,
  runtimeControlsTitle,
  runtimeToggle,
  controlGroup,
} from './style';

export const RuntimeSettings: React.FC<RouteComponentProps> = () => {
  const { state, actions } = useContext(StoreContext);
  const { botName, settings, projectId, location, runtimeSettings } = state;
  const [formDataErrors, setFormDataErrors] = useState({ customRuntimeCommand: '', customRuntimePath: '' });
  const [ejectModalVisible, setEjectModalVisible] = useState(false);

  const changeEnabled = (_, on) => {
    actions.setSettings(projectId, botName, { ...settings, enableCustomRuntime: on });
  };

  const updateSetting = field => (e, newValue) => {
    // TODO: validate these
    const valid = true;
    const error = 'There was an error';

    if (valid) {
      actions.setSettings(projectId, botName, { ...settings, [field]: newValue });
      setFormDataErrors({ ...formDataErrors, [field]: '' });
    } else {
      setFormDataErrors({ ...formDataErrors, [field]: error });
    }
  };

  const header = () => (
    <div css={runtimeControls}>
      <h1 css={runtimeControlsTitle}>{formatMessage('Bot runtime settings')}</h1>
      <p>{formatMessage('Configure Composer to start your bot using runtime code you can customize and control.')}</p>
    </div>
  );

  const toggle = () => (
    <div css={runtimeToggle}>
      <Toggle
        label={formatMessage('Use custom runtime')}
        inlineLabel
        onChange={changeEnabled}
        checked={settings.enableCustomRuntime}
      />
    </div>
  );

  const showEjectModal = () => {
    setEjectModalVisible(true);
  };
  const closeEjectModal = () => {
    setEjectModalVisible(false);
  };

  const ejectRuntime = async template => {
    await actions.ejectRuntime(projectId, template.key);
    closeEjectModal();
  };

  useEffect(() => {
    if (runtimeSettings.path) {
      changeEnabled(null, true);
      actions.setSettings(projectId, botName, {
        ...settings,
        customRuntimePath: location + '/runtime',
        customRuntimeCommand: runtimeSettings.startCommand,
      });
    }
  }, [runtimeSettings]);

  return botName ? (
    <div css={runtimeSettingsStyle}>
      {header()}
      {toggle()}
      <div css={controlGroup}>
        <TextField
          label={formatMessage('Runtime code location')}
          value={settings.customRuntimePath}
          styles={name}
          onChange={updateSetting('customRuntimePath')}
          errorMessage={formDataErrors.customRuntimePath}
          data-testid="runtimeCodeLocation"
          disabled={!settings.enableCustomRuntime}
        />
        {formatMessage('Or: ')}
        <Link onClick={showEjectModal} disabled={!settings.enableCustomRuntime} css={breathingSpace}>
          {formatMessage('Get a new copy of the runtime code')}
        </Link>

        <TextField
          label={formatMessage('Start command')}
          value={settings.customRuntimeCommand}
          styles={name}
          onChange={updateSetting('customRuntimeCommand')}
          errorMessage={formDataErrors.customRuntimeCommand}
          data-testid="runtimeCommand"
          disabled={!settings.enableCustomRuntime}
        />
      </div>
      <EjectModal hidden={!ejectModalVisible} closeModal={closeEjectModal} ejectRuntime={ejectRuntime} />
    </div>
  ) : (
    <div>{formatMessage('Data loading...')}</div>
  );
};
