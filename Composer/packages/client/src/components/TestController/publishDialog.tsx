// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useCallback } from 'react';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { FontWeights, FontSizes } from 'office-ui-fabric-react/lib/Styling';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import formatMessage from 'format-message';
import { ILuisConfig } from '@bfc/shared';

import { Text, Tips, Links, nameRegex } from '../../constants';
import { FieldConfig, useForm } from '../../hooks/useForm';

// -------------------- Styles -------------------- //
const textFieldLabel = css`
  font-weight: ${FontWeights.semibold};
`;

const dialogSubTitle = css`
  font-size: ${FontSizes.medium};
  font-weight: ${FontWeights.semibold};
`;

const dialogContent = css`
  margin-top: 20px;
  margin-bottom: 50px;
`;

const dialog = {
  title: {
    fontWeight: FontWeights.bold,
  },
};

const dialogModal = {
  main: {
    maxWidth: '450px !important',
  },
};

interface LuisFormData {
  name: string;
  authoringKey: string;
  endpointKey: string;
  authoringRegion: string;
  defaultLanguage: string;
  environment: string;
  endpoint: string;
  authoringEndpoint: string;
}

const validate = (value: string) => {
  if (!nameRegex.test(value)) {
    return formatMessage('Spaces and special characters are not allowed. Use letters, numbers, -, or _.');
  }
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

interface IPublishLuisDialogProps {
  botName: string;
  isOpen: boolean;
  config: ILuisConfig;
  onDismiss: () => void;
  onPublish: (data: LuisFormData) => void;
}

export const PublishLuisDialog: React.FC<IPublishLuisDialogProps> = (props) => {
  const { isOpen, onDismiss, onPublish, botName, config } = props;

  const luisFormConfig: FieldConfig<LuisFormData> = {
    name: {
      required: true,
      validate: validate,
      defaultValue: config.name || botName,
    },
    authoringKey: {
      required: true,
      validate: validate,
      defaultValue: config.authoringKey,
    },
    endpointKey: {
      required: false,
      defaultValue: config.endpointKey,
    },
    authoringRegion: {
      required: true,
      defaultValue: config.authoringRegion || 'westus',
    },
    defaultLanguage: {
      required: true,
      defaultValue: config.defaultLanguage || 'en-us',
    },
    environment: {
      required: true,
      validate: validate,
      defaultValue: config.environment,
    },
    endpoint: {
      required: false,
      defaultValue: config.endpoint,
    },
    authoringEndpoint: {
      required: false,
      defaultValue: config.authoringEndpoint,
    },
  };

  const { formData, formErrors, hasErrors, updateField } = useForm(luisFormConfig, { validateOnMount: true });

  const handlePublish = useCallback(
    (e) => {
      e.preventDefault();
      if (hasErrors) {
        return;
      }

      onPublish(formData);
    },
    [hasErrors, formData]
  );

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
        isModeless: true,
        styles: dialogModal,
      }}
      onDismiss={onDismiss}
    >
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
            errorMessage={formErrors.name}
            label={formatMessage('What is the name of your bot?')}
            value={formData.name}
            onChange={(_e, val) => updateField('name', val)}
            onRenderLabel={onRenderLabel(Tips.PROJECT_NAME)}
          />
          <TextField
            data-testid="EnvironmentInput"
            errorMessage={formErrors.environment}
            label={formatMessage('Environment')}
            value={formData.environment}
            onChange={(_e, val) => updateField('environment', val)}
            onRenderLabel={onRenderLabel(Tips.ENVIRONMENT)}
          />
          <TextField
            data-testid="AuthoringKeyInput"
            errorMessage={formErrors.authoringKey}
            label={formatMessage('LUIS Authoring key:')}
            value={formData.authoringKey}
            onChange={(_e, val) => updateField('authoringKey', val)}
            onRenderLabel={onRenderLabel(Tips.AUTHORING_KEY)}
          />
          <TextField
            disabled
            errorMessage={formErrors.authoringRegion}
            label={formatMessage('Authoring Region')}
            value={formData.authoringRegion}
            onRenderLabel={onRenderLabel(Tips.AUTHORING_REGION)}
          />
          <TextField
            disabled
            errorMessage={formErrors.defaultLanguage}
            label={formatMessage('Default Language')}
            value={formData.defaultLanguage}
            onRenderLabel={onRenderLabel(Tips.DEFAULT_LANGUAGE)}
          />
        </Stack>
      </form>
      <DialogFooter>
        <PrimaryButton disabled={hasErrors} text={formatMessage('OK')} onClick={handlePublish} />
        <DefaultButton data-testid={'publish-LUIS-models-cancel'} text={formatMessage('Cancel')} onClick={onDismiss} />
      </DialogFooter>
    </Dialog>
  );
};
