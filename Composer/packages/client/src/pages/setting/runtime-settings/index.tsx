// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useContext } from 'react';
import formatMessage from 'format-message';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { RouteComponentProps } from '@reach/router';

import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { StoreContext } from '../../../store';

import { EjectModal } from './ejectModal';
import { breathingSpace, runtimeSettingsStyle, runtimeControls, runtimeToggle, controlGroup } from './style';

export const RuntimeSettings: React.FC<RouteComponentProps> = () => {
  const { state, actions } = useContext(StoreContext);
  const { botName, settings, projectId } = state;
  const [formDataErrors, setFormDataErrors] = useState({ command: '', path: '' });
  const [ejectModalVisible, setEjectModalVisible] = useState(false);

  const changeEnabled = (_, on) => {
    actions.setSettings(projectId, { ...settings, runtime: { ...settings.runtime, customRuntime: on } });
  };

  const updateSetting = (field) => (e, newValue) => {
    let valid = true;
    let error = 'There was an error';
    if (newValue === '') {
      valid = false;
      error = 'This is a required field.';
    }

    actions.setSettings(projectId, { ...settings, runtime: { ...settings.runtime, [field]: newValue } });

    if (valid) {
      setFormDataErrors({ ...formDataErrors, [field]: '' });
    } else {
      setFormDataErrors({ ...formDataErrors, [field]: error });
    }
  };

  const header = () => (
    <div css={runtimeControls}>
      <p>{formatMessage('Configure Composer to start your bot using runtime code you can customize and control.')}</p>
    </div>
  );

  const toggle = () => (
    <div css={runtimeToggle}>
      <Toggle
        inlineLabel
        checked={settings.runtime && settings.runtime.customRuntime === true}
        label={formatMessage('Use custom runtime')}
        onChange={changeEnabled}
      />
    </div>
  );

  const showEjectModal = () => {
    setEjectModalVisible(true);
  };
  const closeEjectModal = () => {
    setEjectModalVisible(false);
  };

  const ejectRuntime = async (templateKey: string) => {
    await actions.ejectRuntime(projectId, templateKey);
    closeEjectModal();
  };

  return botName ? (
    <div css={runtimeSettingsStyle}>
      {header()}
      {toggle()}
      <div css={controlGroup}>
        <TextField
          required
          data-testid="runtimeCodeLocation"
          disabled={!settings.runtime || !settings.runtime.customRuntime}
          errorMessage={formDataErrors.path}
          label={formatMessage('Runtime code location')}
          styles={name}
          value={settings.runtime ? settings.runtime.path : ''}
          onChange={updateSetting('path')}
        />
        {formatMessage('Or: ')}
        <Link
          css={breathingSpace}
          disabled={!settings.runtime || !settings.runtime.customRuntime}
          onClick={showEjectModal}
        >
          {formatMessage('Get a new copy of the runtime code')}
        </Link>

        <TextField
          required
          data-testid="runtimeCommand"
          disabled={!settings.runtime || !settings.runtime.customRuntime}
          errorMessage={formDataErrors.command}
          label={formatMessage('Start command')}
          styles={name}
          value={settings.runtime ? settings.runtime.command : ''}
          onChange={updateSetting('command')}
        />
      </div>
      <EjectModal closeModal={closeEjectModal} ejectRuntime={ejectRuntime} hidden={!ejectModalVisible} />
    </div>
  ) : (
    <LoadingSpinner />
  );
};
