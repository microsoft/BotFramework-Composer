// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, Fragment, useEffect } from 'react';
import formatMessage from 'format-message';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { RouteComponentProps } from '@reach/router';
import { useRecoilValue } from 'recoil';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { OpenConfirmModal } from '@bfc/ui-shared';

import {
  dispatcherState,
  ejectRuntimeSelector,
  boilerplateVersionState,
  botDisplayNameState,
  settingsState,
  isEjectRuntimeExistState,
} from '../../../recoilModel';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import TelemetryClient from '../../../telemetry/TelemetryClient';
import { sectionHeader } from '../common';

import { EjectModal } from './ejectModal';
import { WorkingModal } from './workingModal';
import {
  breathingSpace,
  runtimeSettingsStyle,
  runtimeToggle,
  labelContainer,
  customerLabel,
  iconStyle,
  textOr,
  updateText,
} from './style';

export const RuntimeSettings: React.FC<RouteComponentProps<{ projectId: string }>> = (props) => {
  const { projectId = '' } = props;
  const botName = useRecoilValue(botDisplayNameState(projectId));
  const settings = useRecoilValue(settingsState(projectId));
  const ejectedRuntimeExists = useRecoilValue(isEjectRuntimeExistState(projectId));

  const boilerplateVersion = useRecoilValue(boilerplateVersionState);
  const {
    setCustomRuntime,
    setRuntimeField,
    getBoilerplateVersion,
    updateBoilerplate,
    stopPublishBot,
  } = useRecoilValue(dispatcherState);
  const runtimeEjection = useRecoilValue(ejectRuntimeSelector);

  const [formDataErrors, setFormDataErrors] = useState({ command: '', path: '' });
  const [ejectModalVisible, setEjectModalVisible] = useState(false);
  const [working, setWorking] = useState(false);
  const [ejecting, setEjecting] = useState(false);
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [templateKey, setTemplateKey] = useState('');

  useEffect(() => {
    // check the status of the boilerplate material and see if it requires an update
    if (projectId) getBoilerplateVersion(projectId);
  }, [projectId]);

  useEffect(() => {
    setNeedsUpdate(!!boilerplateVersion.updateRequired);
  }, [boilerplateVersion.updateRequired]);

  useEffect(() => {
    if (ejectedRuntimeExists && templateKey) {
      confirmReplaceEject(templateKey);
      setTemplateKey('');
    }
  }, [ejectedRuntimeExists, templateKey]);

  const toggleCustomRuntime = (_, isOn = false) => {
    setCustomRuntime(projectId, isOn);
    TelemetryClient.track('CustomRuntimeToggleChanged', { enabled: isOn });
  };

  const updateSetting = (field) => (e, newValue) => {
    let valid = true;
    let error = formatMessage('There was an error');
    if (newValue === '') {
      valid = false;
      error = formatMessage('This is a required field.');
    }

    setRuntimeField(projectId, field, newValue);

    if (valid) {
      setFormDataErrors({ ...formDataErrors, [field]: '' });
    } else {
      setFormDataErrors({ ...formDataErrors, [field]: error });
    }
  };

  const header = () => (
    <div css={sectionHeader}>
      {formatMessage('Configure Composer to start your bot using runtime code you can customize and control.')}
    </div>
  );

  const toggleOfCustomRuntime = () => (
    <div css={runtimeToggle}>
      <Toggle
        inlineLabel
        checked={settings.runtime?.customRuntime}
        label={formatMessage('Use custom runtime')}
        onChange={toggleCustomRuntime}
      />
    </div>
  );

  const showEjectModal = () => {
    setEjectModalVisible(true);
  };
  const closeEjectModal = () => {
    setEjectModalVisible(false);
  };

  const callEjectRuntime = async (templateKey: string) => {
    setEjecting(true);
    closeEjectModal();
    await runtimeEjection?.onAction(projectId, templateKey);
    setEjecting(false);
    setTemplateKey(templateKey);
    TelemetryClient.track('GetNewRuntime', { runtimeType: templateKey });
  };

  const callUpdateBoilerplate = async () => {
    const title = formatMessage('Update Scripts');
    const msg = formatMessage(
      'Existing files in scripts/folder will be overwritten. Are you sure you want to continue?'
    );
    const res = await OpenConfirmModal(title, msg);
    if (res) {
      setWorking(true);
      await updateBoilerplate(projectId);
      // add a slight delay, so the working indicator is visible for a moment at least!
      await new Promise((resolve) => {
        setTimeout(() => {
          setWorking(false);
          resolve();
        }, 500);
      });
    }
  };

  const confirmReplaceEject = async (templateKey: string) => {
    const title = formatMessage('Runtime already exists');
    const msg = formatMessage('Are you sure you want to stop current runtime and replace them?');
    const res = await OpenConfirmModal(title, msg);
    if (res) {
      setEjecting(true);
      // stop runtime
      await stopPublishBot(projectId);
      // replace the runtime
      await runtimeEjection?.onAction(projectId, templateKey, true);
      setEjecting(false);
    }
  };

  const onRenderLabel = (props) => {
    return (
      <div css={labelContainer}>
        <div css={customerLabel(props.disabled)}> {props.label} </div>
        <TooltipHost content={props.label}>
          <Icon iconName="Unknown" styles={iconStyle(props.disabled)} />
        </TooltipHost>
      </div>
    );
  };

  return botName ? (
    <div css={runtimeSettingsStyle} id="runtimeSettings">
      {header()}
      {toggleOfCustomRuntime()}
      <div>
        <TextField
          required
          data-testid="runtimeCodeLocation"
          disabled={!settings.runtime || !settings.runtime.customRuntime}
          errorMessage={formDataErrors.path}
          label={formatMessage('Runtime code location')}
          styles={name}
          value={settings.runtime ? settings.runtime.path : ''}
          onChange={updateSetting('path')}
          onRenderLabel={onRenderLabel}
        />
        <span css={textOr}>{formatMessage('Or: ')}</span>
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
          onRenderLabel={onRenderLabel}
        />
      </div>
      {needsUpdate && (
        <div>
          <p css={updateText}>
            {formatMessage(
              'A newer version of the provisioning scripts has been found, and this project can be updated to the latest.'
            )}
          </p>
          <DefaultButton disabled={working} onClick={callUpdateBoilerplate}>
            {working && (
              <Fragment>
                <Spinner />
                &nbsp;
                {formatMessage('Updating scripts... ')}
              </Fragment>
            )}
            {!working && <Fragment>{formatMessage('Update scripts')}</Fragment>}
          </DefaultButton>
        </div>
      )}
      <WorkingModal isOpen={ejecting} title={formatMessage('Ejecting runtime...')} />
      <EjectModal ejectRuntime={callEjectRuntime} hidden={!ejectModalVisible} onDismiss={closeEjectModal} />
    </div>
  ) : (
    <LoadingSpinner />
  );
};
