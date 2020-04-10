// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useContext } from 'react';
import formatMessage from 'format-message';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Link } from 'office-ui-fabric-react';
import { StoreContext } from '../../../store';
import { EjectModal } from './ejectModal';
import { runtimeSettings, runtimeControls, runtimeControlsTitle, runtimeToggle, settingsEditor } from './style';

export const RuntimeSettings = () => {
  const { state, actions } = useContext(StoreContext);
  const { botName, settings, projectId } = state;
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
      <p>{formatMessage('Configure Composer to start your bot using your customized runtime code.')}</p>
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

  const ejectRuntime = template => {
    console.log('EJECT RUNTIME USING TEMPLATE', template);

    changeEnabled(null, true);
    closeEjectModal();
  };

  return botName ? (
    <div css={runtimeSettings}>
      {header()}
      {toggle()}
      <div css={settingsEditor}>
        <TextField
          label={formatMessage('Runtime code location')}
          value={settings.customRuntimePath}
          styles={name}
          onChange={updateSetting('customRuntimePath')}
          errorMessage={formDataErrors.customRuntimePath}
          data-testid="runtimeCodeLocation"
          disabled={!settings.enableCustomRuntime}
        />
        or <Link onClick={showEjectModal}>Get a new copy of the runtime code</Link>
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
