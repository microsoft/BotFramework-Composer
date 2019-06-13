/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, Fragment } from 'react';
import {
  Dialog,
  DialogType,
  DialogFooter,
  PrimaryButton,
  DefaultButton,
  TextField,
  Spinner,
  SpinnerSize,
  Link,
  Stack,
  IconButton,
  TooltipHost,
} from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import { PropTypes } from 'prop-types';
import { keys } from 'lodash';

import storage from './../../utils/storage';
import { Tips, Links } from './../../constants';
import { textFieldLabel, dialog, dialogModal, dialogSubTitle, dialogContent, consoleStyle } from './styles';
import { Text } from './../../constants/index';

const AUTHORINGKEY = 'authoringKey';
const ENVIRONMENT = 'environment';
const PROJECTNAME = 'name';

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

const getDefaultData = () => {
  return {
    name: storage.get(PROJECTNAME, ''),
    environment: storage.get(ENVIRONMENT, ''),
    authoringKey: storage.get(AUTHORINGKEY, ''),
    authoringRegion: 'westus',
    defaultLanguage: 'en-us',
    errors: {},
  };
};

const nameRegex = /^[a-zA-Z0-9-_.]+$/;

const validateForm = data => {
  const errors = {};
  const dataKeys = keys(data);

  dataKeys.forEach(key => {
    const value = data[key];
    if (key !== 'errors' && (!value || !nameRegex.test(value))) {
      errors[key] = 'must only use letters, numbers, -, and _';
    }
  });

  return errors;
};

const DeploySuccess = props => {
  const status = props.status;
  const appNames = keys(status);
  return (
    <Fragment>
      <div css={consoleStyle}>
        {appNames.map(item => {
          return (
            <div key={item}>
              {item}:{status[item].version}
            </div>
          );
        })}
      </div>
      <div css={dialogSubTitle}>
        {Text.LUISDEPLOYSUCCESS}
        <span>Work on it in </span>
        <Link href={Links.LUIS}>Luis</Link>
        <span> or return to your previous task</span>
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

export default function PublishLuisModal(props) {
  const { isOpen, onDismiss, onPublish } = props;
  const [formData, setFormData] = useState(getDefaultData());
  const [state, setState] = useState(STATE.INPUT);
  const [response, setResponse] = useState({});

  const updateForm = field => (e, newValue) => {
    setFormData({ ...formData, errors: {}, [field]: newValue });
    storage.set(field, newValue);
  };

  const handleDismiss = () => {
    onDismiss();
  };

  const handlePublish = async e => {
    e.preventDefault();

    const errors = validateForm(formData);
    if (keys(errors).length) {
      setFormData({ ...formData, errors });
      return;
    }

    setState(STATE.PUBLISHPENDING);
    const response = await onPublish({ ...formData });
    setResponse(response);
    if (response.error === '') {
      setState(STATE.PUBLISHSUCCESS);
    } else {
      setState(STATE.PUBLISHFAILURE);
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
      {state === STATE.PUBLISHSUCCESS && <DeploySuccess onDismiss={handleDismiss} status={response.status} />}
      {state === STATE.PUBLISHFAILURE && (
        <DeployFailure onDismiss={handleDismiss} tryAgain={() => setState(STATE.INPUT)} error={response.error} />
      )}
      {(state === STATE.INPUT || state === STATE.PUBLISHPENDING) && (
        <Fragment>
          <div css={dialogSubTitle}>
            {formatMessage(Text.LUISDEPLOY)}
            <Link href={Links.LUIS}>Where can I find this?</Link>
          </div>
          <form onSubmit={handlePublish} css={dialogContent}>
            <Stack gap={20}>
              <TextField
                label={formatMessage('Project Name')}
                onChange={updateForm('name')}
                defaultValue={formData.name}
                onRenderLabel={onRenderLabel(formatMessage(Tips.PROJECTNAME))}
                errorMessage={formatMessage(formData.errors.name || '')}
              />
              <TextField
                label={formatMessage('Environment')}
                onChange={updateForm('environment')}
                defaultValue={formData.environment}
                onRenderLabel={onRenderLabel(formatMessage(Tips.ENVIRONMENT))}
                errorMessage={formatMessage(formData.errors.environment || '')}
              />
              <TextField
                label={formatMessage('Authoring key')}
                onChange={updateForm('authoringKey')}
                defaultValue={formData.authoringKey}
                errorMessage={formatMessage(formData.errors.authoringKey || '')}
              />
              <TextField
                label={formatMessage('Authoring Region')}
                defaultValue="westus"
                onRenderLabel={onRenderLabel(formatMessage(Tips.AUTHORINGREGION))}
                disabled
              />
              <TextField
                label={formatMessage('Default Language')}
                defaultValue="en-us"
                onRenderLabel={onRenderLabel(formatMessage(Tips.DEFAULTLANGUAGE))}
                disabled
              />
            </Stack>
          </form>
          <DialogFooter>
            <PrimaryButton onClick={handlePublish} text={formatMessage('Publish')}>
              {state === STATE.PUBLISHPENDING ? <Spinner size={SpinnerSize.small} /> : null}
            </PrimaryButton>
            <DefaultButton onClick={handleDismiss} text={formatMessage('Cancel')} />
          </DialogFooter>
        </Fragment>
      )}
    </Dialog>
  );
}

PublishLuisModal.propTypes = {
  isOpen: PropTypes.bool,
  onDismiss: PropTypes.func,
  onPublish: PropTypes.func,
};
