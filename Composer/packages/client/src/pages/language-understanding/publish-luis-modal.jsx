// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useContext, Fragment } from 'react';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import formatMessage from 'format-message';
import { PropTypes } from 'prop-types';
import keys from 'lodash/keys';

import { StoreContext } from '../../store';

import { Text, Tips, Links } from './../../constants';
import { textFieldLabel, dialog, dialogModal, dialogSubTitle, dialogContent, consoleStyle } from './styles';

const STATE = {
  INPUT: 0,
  PUBLISHPENDING: 1,
  PUBLISHSUCCESS: 2,
  PUBLISHFAILURE: 3,
};

// eslint-disable-next-line react/display-name
const onRenderLabel = info => props => (
  <Stack horizontal verticalAlign="center">
    <span css={textFieldLabel}>{props.label}</span>
    <TooltipHost content={info} calloutProps={{ gapSpace: 0 }}>
      <IconButton iconProps={{ iconName: 'Info' }} styles={{ root: { marginBottom: -3 } }} />
    </TooltipHost>
  </Stack>
);

const nameRegex = /^[a-zA-Z0-9-_.]+$/;
const validationProperties = ['name', 'authoringKey', 'environment'];
const defaultFields = { authoringRegion: 'westus', defaultLanguage: 'en-us' };
const validateForm = data => {
  const result = { errors: {} };
  const dataKeys = keys(data);

  dataKeys.forEach(key => {
    const value = data[key];
    if (validationProperties.includes(key) && (!value || !nameRegex.test(value))) {
      result.errors[key] = formatMessage(
        'Spaces and special characters are not allowed. Use letters, numbers, -, or _., numbers, -, and _'
      );
    } else if (key in defaultFields && value === '') {
      result[key] = defaultFields[key];
    }
  });

  return result;
};

const DeploySuccess = props => {
  const status = props.status;
  const appNames = keys(status);
  return (
    <Fragment>
      <div css={consoleStyle}>
        {appNames.map(item => {
          return <div key={item}>{`${item}:${status[item].version}`}</div>;
        })}
      </div>
      <div css={dialogSubTitle}>
        {Text.LUISDEPLOYSUCCESS}
        <span>{formatMessage('Work on it in ')}</span>
        <Link href={Links.LUIS} target="_blank">
          {formatMessage('Luis')}
        </Link>
        <span>{formatMessage(' or return to your previous task')}</span>
      </div>
      <DialogFooter>
        <PrimaryButton onClick={props.onDismiss} text={formatMessage('Return')} />
      </DialogFooter>
    </Fragment>
  );
};

const DeployFailure = props => {
  return (
    <Fragment>
      <div css={consoleStyle}>{props.error}</div>
      <div css={dialogSubTitle}>{Text.LUISDEPLOYFAILURE}</div>
      <DialogFooter>
        <PrimaryButton onClick={props.tryAgain} text={formatMessage('Try again')} />
        <DefaultButton onClick={props.onDismiss} text={formatMessage('Cancel')} />
      </DialogFooter>
    </Fragment>
  );
};

export const PublishLuis = props => {
  const { state, actions } = useContext(StoreContext);
  const { setSettings } = actions;
  const { botName, settings } = state;
  const { onPublish, onDismiss, workState } = props;

  const initialFormData = {
    name: settings.luis.name || botName,
    authoringKey: settings.luis.authoringKey,
    endpointKey: settings.luis.endpointKey,
    authoringRegion: settings.luis.authoringRegion,
    defaultLanguage: settings.luis.defaultLanguage,
    environment: settings.luis.environment,
    errors: {},
  };

  const [formData, setFormData] = useState(initialFormData);

  const updateForm = field => (e, newValue) => {
    setFormData({ ...formData, errors: {}, [field]: newValue });
  };

  const handlePublish = async e => {
    e.preventDefault();

    const result = validateForm(formData);
    if (keys(result.errors).length) {
      setFormData({ ...formData, ...result });
      return;
    }
    // save the settings change to store and persist to server
    const newValue = { ...formData, ...result };
    delete newValue.errors;
    await setSettings(state.projectId, botName, { ...settings, luis: newValue });
    await onPublish();
  };

  return (
    <Fragment>
      <div css={dialogSubTitle}>
        {Text.LUISDEPLOY}{' '}
        <Link href={Links.LUIS} target="_blank">
          {formatMessage('Learn more.')}
        </Link>
      </div>
      <form onSubmit={handlePublish} css={dialogContent}>
        <Stack gap={20}>
          <TextField
            label={formatMessage('What is the name of your bot?')}
            onChange={updateForm('name')}
            defaultValue={formData.name}
            onRenderLabel={onRenderLabel(Tips.PROJECT_NAME)}
            errorMessage={formData.errors.name || ''}
            data-testid="ProjectNameInput"
          />
          <TextField
            label={formatMessage('Environment')}
            onChange={updateForm('environment')}
            defaultValue={formData.environment}
            onRenderLabel={onRenderLabel(Tips.ENVIRONMENT)}
            errorMessage={formData.errors.environment || ''}
            data-testid="EnvironmentInput"
          />
          <TextField
            label={formatMessage('LUIS Primary key:')}
            onChange={updateForm('authoringKey')}
            defaultValue={formData.authoringKey}
            onRenderLabel={onRenderLabel(Tips.AUTHORING_KEY)}
            errorMessage={formData.errors.authoringKey || ''}
            data-testid="AuthoringKeyInput"
          />
          <TextField
            label={formatMessage('Authoring Region')}
            defaultValue={formData.authoringRegion || defaultFields.authoringRegion}
            onRenderLabel={onRenderLabel(Tips.AUTHORING_REGION)}
            disabled
          />
          <TextField
            label={formatMessage('Default Language')}
            defaultValue={formData.defaultLanguage || defaultFields.defaultLanguage}
            onRenderLabel={onRenderLabel(Tips.DEFAULT_LANGUAGE)}
            disabled
          />
        </Stack>
      </form>
      <DialogFooter>
        <PrimaryButton onClick={handlePublish} text={formatMessage('OK')} disabled={workState === STATE.PUBLISHPENDING}>
          {workState === STATE.PUBLISHPENDING ? <Spinner size={SpinnerSize.small} /> : null}
        </PrimaryButton>
        <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} data-testid={'publish-LUIS-models-cancel'} />
      </DialogFooter>
    </Fragment>
  );
};

export function PublishLuisModal(props) {
  const { isOpen, onDismiss, onPublish, botName } = props;
  const [workState, setWorkState] = useState(STATE.INPUT);
  const [response, setResponse] = useState({});

  const handleDismiss = () => {
    onDismiss();
  };

  const handlePublish = async formData => {
    setWorkState(STATE.PUBLISHPENDING);
    const response = await onPublish({ ...formData });
    setResponse(response);
    if (response.error === '') {
      setWorkState(STATE.PUBLISHSUCCESS);
    } else {
      setWorkState(STATE.PUBLISHFAILURE);
    }
  };

  return (
    <Dialog
      hidden={!isOpen}
      onDismiss={handleDismiss}
      dialogContentProps={{
        type: DialogType.normal,
        title: formatMessage('Publish LUIS models'),
        styles: dialog,
      }}
      modalProps={{
        isBlocking: false,
        styles: dialogModal,
      }}
    >
      {workState === STATE.PUBLISHSUCCESS && <DeploySuccess onDismiss={handleDismiss} status={response.status} />}
      {workState === STATE.PUBLISHFAILURE && (
        <DeployFailure onDismiss={handleDismiss} tryAgain={() => setWorkState(STATE.INPUT)} error={response.error} />
      )}
      {(workState === STATE.INPUT || workState === STATE.PUBLISHPENDING) && (
        <PublishLuis onPublish={handlePublish} onDismiss={handleDismiss} workState={workState} botName={botName} />
      )}
    </Dialog>
  );
}

PublishLuisModal.propTypes = {
  isOpen: PropTypes.bool,
  onDismiss: PropTypes.func,
  onPublish: PropTypes.func,
};
