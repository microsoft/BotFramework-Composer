// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useCallback, Fragment } from 'react';
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
import { useRecoilValue } from 'recoil';
import { IConfig, IPublishConfig } from '@bfc/shared';
import { Dropdown, ResponsiveMode, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';

import { Text, Tips, Links, nameRegex } from '../../constants';
import { FieldConfig, useForm } from '../../hooks/useForm';
import { dialogsState, luFilesState, qnaFilesState } from '../../recoilModel/atoms/botState';
import { getReferredQnaFiles } from '../../utils/qnaUtil';
import { getReferredLuFiles } from '../../utils/luUtil';

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
interface FormData {
  name: string;
  authoringKey: string;
  subscriptionKey: string;
  qnaRegion: string;
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

const regionOptions: IDropdownOption[] = [
  {
    key: 'westus',
    text: formatMessage('westus'),
  },
  {
    key: 'westeurope',
    text: formatMessage('westeurope'),
  },
  {
    key: 'australia',
    text: formatMessage('australia'),
  },
];

interface IPublishDialogProps {
  botName: string;
  isOpen: boolean;
  config: IConfig;
  onDismiss: () => void;
  onPublish: (data: IPublishConfig) => void;
}

export const PublishDialog: React.FC<IPublishDialogProps> = (props) => {
  const { isOpen, onDismiss, onPublish, botName, config } = props;
  const dialogs = useRecoilValue(dialogsState);
  const luFiles = useRecoilValue(luFilesState);
  const qnaFiles = useRecoilValue(qnaFilesState);
  const qnaConfigShow = getReferredQnaFiles(qnaFiles, dialogs).length > 0;
  const luConfigShow = getReferredLuFiles(luFiles, dialogs).length > 0;

  const formConfig: FieldConfig<FormData> = {
    name: {
      required: true,
      validate: validate,
      defaultValue: config.name || botName,
    },
    authoringKey: {
      required: luConfigShow,
      validate: validate,
      defaultValue: config.authoringKey,
    },
    subscriptionKey: {
      required: qnaConfigShow,
      validate: validate,
      defaultValue: config.subscriptionKey,
    },
    qnaRegion: {
      required: true,
      defaultValue: config.qnaRegion || 'westus',
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

  const { formData, formErrors, hasErrors, updateField } = useForm(formConfig, { validateOnMount: true });

  const handlePublish = useCallback(
    (e) => {
      e.preventDefault();
      if (hasErrors) {
        return;
      }
      const newValue = Object.assign({}, formData);
      const subscriptionKey = formData.subscriptionKey;
      const qnaRegion = formData.qnaRegion;
      delete newValue.subscriptionKey;
      delete newValue.qnaRegion;
      const publishConfig = {
        luis: newValue,
        qna: {
          subscriptionKey,
          qnaRegion,
          endpointKey: '',
        },
      };
      onPublish(publishConfig);
    },
    [hasErrors, formData]
  );

  const luisTitleRender = () => {
    return (
      <Fragment>
        <br />
        {Text.LUISDEPLOY}
        <Link href={Links.LUIS} target="_blank">
          {formatMessage('Learn more.')}
        </Link>
      </Fragment>
    );
  };

  const qnaTitleRender = () => {
    return (
      <Fragment>
        <br />
        {Text.QNADEPLOY}
        <Link href={Links.QNA} target="_blank">
          {formatMessage('Learn more.')}
        </Link>
      </Fragment>
    );
  };
  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: formatMessage('Publish models'),
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
        {Text.DEPLOY}
        {luConfigShow ? luisTitleRender() : ''}
        {qnaConfigShow ? qnaTitleRender() : ''}
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
          {luConfigShow && (
            <Fragment>
              <TextField
                data-testid="AuthoringKeyInput"
                errorMessage={formErrors.authoringKey}
                label={formatMessage('LUIS Authoring key:')}
                value={formData.authoringKey}
                onChange={(_e, val) => updateField('authoringKey', val)}
                onRenderLabel={onRenderLabel(Tips.AUTHORING_KEY)}
              />
              <Dropdown
                data-testid="regionDropdown"
                label={formatMessage('Luis Authoring Region')}
                options={regionOptions}
                responsiveMode={ResponsiveMode.large}
                selectedKey={formData.authoringRegion}
                onChange={(_e, option) => {
                  if (option) {
                    updateField('authoringRegion', option.key.toString());
                  }
                }}
              />
            </Fragment>
          )}
          {qnaConfigShow && (
            <Fragment>
              <TextField
                data-testid="SubscriptionKeyInput"
                errorMessage={formErrors.subscriptionKey}
                label={formatMessage('QNA Subscription key:')}
                value={formData.subscriptionKey}
                onChange={(_e, val) => updateField('subscriptionKey', val)}
                onRenderLabel={onRenderLabel(Tips.SUBSCRIPTION_KEY)}
              />
              <TextField
                disabled
                errorMessage={formErrors.qnaRegion}
                label={formatMessage('QnA Region')}
                value={formData.qnaRegion}
                onRenderLabel={onRenderLabel(Tips.AUTHORING_REGION)}
              />
            </Fragment>
          )}
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
