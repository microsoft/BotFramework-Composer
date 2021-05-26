// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, Fragment, useEffect, useMemo } from 'react';
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
import { isUsingAdaptiveRuntime } from '@bfc/shared';

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
import { subtext, errorContainer, errorTextStyle, errorIcon, inputFieldStyles } from '../styles';
import { DisableFeatureToolTip } from '../../../components/DisableFeatureToolTip';
import { usePVACheck } from '../../../hooks/usePVACheck';

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

type RuntimeType = 'path' | 'command';

export const RuntimeSettings: React.FC<RouteComponentProps<{ projectId: string }>> = (props) => {
  const { projectId = '' } = props;
  const botName = useRecoilValue(botDisplayNameState(projectId));
  const settings = useRecoilValue(settingsState(projectId));
  const ejectedRuntimeExists = useRecoilValue(isEjectRuntimeExistState(projectId));
  const isPVABot = usePVACheck(projectId);

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
  const [runtimePath, setRuntimePath] = useState(settings.runtime?.path ?? '');
  const [runtimeCommand, setRuntimeCommand] = useState(settings.runtime?.command ?? '');
  const [usingCustomRuntime, setUsingCustomRuntime] = useState(settings.runtime?.customRuntime ?? false);
  const isAdaptive = useMemo(() => isUsingAdaptiveRuntime(settings.runtime), [settings]);

  useEffect(() => {
    // check the status of the boilerplate material and see if it requires an update
    if (projectId) getBoilerplateVersion(projectId);
  }, [projectId]);

  useEffect(() => {
    setRuntimePath(settings.runtime?.path ?? '');
    setRuntimeCommand(settings.runtime?.command ?? '');
    setUsingCustomRuntime(settings.runtime?.customRuntime ?? false);
    const errorMessage = formatMessage('This is a required field.');
    const errors = { command: '', path: '' };
    if (!settings.runtime?.path && settings.runtime?.customRuntime) {
      errors.path = errorMessage;
    }
    if (!settings.runtime?.command && settings.runtime?.customRuntime) {
      errors.command = errorMessage;
    }
    setFormDataErrors(errors);
  }, [settings, projectId]);

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
    setUsingCustomRuntime(isOn);
    TelemetryClient.track('CustomRuntimeToggleChanged', { enabled: isOn });
  };

  const handleRuntimeSettingOnChange = (field: RuntimeType) => (e, newValue) => {
    let valid = true;
    let error = formatMessage('There was an error');
    if (newValue === '') {
      valid = false;
      error = formatMessage('This is a required field.');
    }

    if (field === 'path') {
      setRuntimePath(newValue);
    } else {
      setRuntimeCommand(newValue);
    }

    if (valid) {
      setFormDataErrors({ ...formDataErrors, [field]: '' });
    } else {
      setFormDataErrors({ ...formDataErrors, [field]: error });
    }
  };

  const handleRuntimeSettingOnBlur = (field: RuntimeType) => {
    if (field === 'path') {
      setRuntimeField(projectId, field, runtimePath);
    } else {
      setRuntimeField(projectId, field, runtimeCommand);
    }
  };

  const header = () => (
    <div css={subtext}>
      {formatMessage(
        'Configure Composer to start your bot using runtime code you can customize and control. Leave the field below blank if you don’t require customization.'
      )}
    </div>
  );

  const toggleOfCustomRuntime = () => (
    <div css={runtimeToggle}>
      <DisableFeatureToolTip isPVABot={isPVABot}>
        <Toggle
          inlineLabel
          checked={usingCustomRuntime}
          disabled={isPVABot}
          label={formatMessage('Use custom runtime')}
          onChange={toggleCustomRuntime}
        />
      </DisableFeatureToolTip>
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
    const title = formatMessage('Update scripts');
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
      {!isAdaptive && toggleOfCustomRuntime()}
      <div>
        {!isAdaptive && (
          <TextField
            required
            data-testid="runtimeCodeLocation"
            disabled={!settings.runtime || !settings.runtime.customRuntime}
            errorMessage={errorElement(formDataErrors.path)}
            label={formatMessage('Runtime code location')}
            styles={inputFieldStyles}
            value={runtimePath}
            onBlur={() => handleRuntimeSettingOnBlur('path')}
            onChange={handleRuntimeSettingOnChange('path')}
            onRenderLabel={onRenderLabel}
          />
        )}
        {!isAdaptive && (
          <div>
            <span css={textOr}>{formatMessage('Or: ')}</span>
            <Link
              css={breathingSpace}
              disabled={!settings.runtime || !settings.runtime.customRuntime}
              onClick={showEjectModal}
            >
              {formatMessage('Get a new copy of the runtime code')}
            </Link>
          </div>
        )}
      </div>
      <div>
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
