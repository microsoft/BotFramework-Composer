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
import { PropTypes } from 'prop-types';
import formatMessage from 'format-message';
import keys from 'lodash/keys';

import { StoreContext } from '../../store';
import { Text, Tips, Links, nameRegex } from '../../constants';

import { textFieldLabel, dialog, dialogModal, dialogSubTitle, dialogContent, consoleStyle } from './styles';

const STATE = {
  INPUT: 0,
  PUBLISHPENDING: 1,
  PUBLISHSUCCESS: 2,
  PUBLISHFAILURE: 3,
};

// eslint-disable-next-line react/display-name
const onRenderLabel = (info) => (props) => (
  <Stack horizontal verticalAlign="center">
    <span css={textFieldLabel}>{props.label}</span>
    <TooltipHost calloutProps={{ gapSpace: 0 }} content={info}>
      <IconButton iconProps={{ iconName: 'Info' }} styles={{ root: { marginBottom: -3 } }} />
    </TooltipHost>
  </Stack>
);

const validationProperties = ['name', 'authoringKey', 'environment'];
const defaultFields = { authoringRegion: 'westus', defaultLanguage: 'en-us' };
const validateForm = (data) => {
  const result = { errors: {} };
  const dataKeys = keys(data);

  dataKeys.forEach((key) => {
    const value = data[key];
    if (validationProperties.includes(key) && (!value || !nameRegex.test(value))) {
      result.errors[key] = formatMessage(
        'Spaces and special characters are not allowed. Use letters, numbers, -, or _.'
      );
    } else if (key in defaultFields && value === '') {
      result[key] = defaultFields[key];
    }
  });

  return result;
};

const DeploySuccess = (props) => {
  const status = props.status;
  const appNames = keys(status);
  return (
    <Fragment>
      <div css={consoleStyle}>
        {appNames.map((item) => {
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
        <PrimaryButton text={formatMessage('Return')} onClick={props.onDismiss} />
      </DialogFooter>
    </Fragment>
  );
};

const DeployFailure = (props) => {
  return (
    <Fragment>
      <div css={consoleStyle}>{props.error}</div>
      <div css={dialogSubTitle}>{Text.LUISDEPLOYFAILURE}</div>
      <DialogFooter>
        <PrimaryButton text={formatMessage('Try again')} onClick={props.tryAgain} />
        <DefaultButton text={formatMessage('Cancel')} onClick={props.onDismiss} />
      </DialogFooter>
    </Fragment>
  );
};

export const PublishLuis = (props) => {
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
    endpoint: settings.luis.endpoint,
    authoringEndpoint: settings.luis.authoringEndpoint,
    errors: {},
  };

  const [formData, setFormData] = useState(initialFormData);

  const updateForm = (field) => (e, newValue) => {
    setFormData({ ...formData, errors: {}, [field]: newValue });
  };

  const handlePublish = async (e) => {
    e.preventDefault();

    const result = validateForm(formData);
    if (keys(result.errors).length) {
      setFormData({ ...formData, ...result });
      return;
    }
    // save the settings change to store and persist to server
    const newValue = { ...formData, ...result };
    delete newValue.errors;
    await setSettings(state.projectId, { ...settings, luis: newValue });
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
      <form css={dialogContent} onSubmit={handlePublish}>
        <Stack gap={20}>
          <TextField
            data-testid="ProjectNameInput"
            defaultValue={formData.name}
            errorMessage={formData.errors.name || ''}
            label={formatMessage('What is the name of your bot?')}
            onChange={updateForm('name')}
            onRenderLabel={onRenderLabel(Tips.PROJECT_NAME)}
          />
          <TextField
            data-testid="EnvironmentInput"
            defaultValue={formData.environment}
            errorMessage={formData.errors.environment || ''}
            label={formatMessage('Environment')}
            onChange={updateForm('environment')}
            onRenderLabel={onRenderLabel(Tips.ENVIRONMENT)}
          />
          <TextField
            data-testid="AuthoringKeyInput"
            defaultValue={formData.authoringKey}
            errorMessage={formData.errors.authoringKey || ''}
            label={formatMessage('LUIS Authoring key:')}
            onChange={updateForm('authoringKey')}
            onRenderLabel={onRenderLabel(Tips.AUTHORING_KEY)}
          />
          <TextField
            disabled
            defaultValue={formData.authoringRegion || defaultFields.authoringRegion}
            label={formatMessage('Authoring Region')}
            onRenderLabel={onRenderLabel(Tips.AUTHORING_REGION)}
          />
          <TextField
            disabled
            defaultValue={formData.defaultLanguage || defaultFields.defaultLanguage}
            label={formatMessage('Default Language')}
            onRenderLabel={onRenderLabel(Tips.DEFAULT_LANGUAGE)}
          />
        </Stack>
      </form>
      <DialogFooter>
        <PrimaryButton disabled={workState === STATE.PUBLISHPENDING} text={formatMessage('OK')} onClick={handlePublish}>
          {workState === STATE.PUBLISHPENDING ? <Spinner size={SpinnerSize.small} /> : null}
        </PrimaryButton>
        <DefaultButton data-testid={'publish-LUIS-models-cancel'} text={formatMessage('Cancel')} onClick={onDismiss} />
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

  const handlePublish = async (formData) => {
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
      dialogContentProps={{
        type: DialogType.normal,
        title: formatMessage('Publish LUIS models'),
        styles: dialog,
      }}
      hidden={!isOpen}
      modalProps={{
        isBlocking: false,
        styles: dialogModal,
      }}
      onDismiss={handleDismiss}
    >
      {workState === STATE.PUBLISHSUCCESS && <DeploySuccess status={response.status} onDismiss={handleDismiss} />}
      {workState === STATE.PUBLISHFAILURE && (
        <DeployFailure error={response.error} tryAgain={() => setWorkState(STATE.INPUT)} onDismiss={handleDismiss} />
      )}
      {(workState === STATE.INPUT || workState === STATE.PUBLISHPENDING) && (
        <PublishLuis botName={botName} workState={workState} onDismiss={handleDismiss} onPublish={handlePublish} />
      )}
    </Dialog>
  );
}

PublishLuisModal.propTypes = {
  isOpen: PropTypes.bool,
  onDismiss: PropTypes.func,
  onPublish: PropTypes.func,
};
