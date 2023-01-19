// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import React, { useCallback, Fragment } from 'react';
import { Dialog, DialogType } from '@fluentui/react/lib/Dialog';
import { FontWeights, FontSizes } from '@fluentui/react/lib/Styling';
import { DialogFooter } from '@fluentui/react/lib/Dialog';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { Link } from '@fluentui/react/lib/Link';
import { Stack } from '@fluentui/react/lib/Stack';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';
import { IConfig, IPublishConfig, IQnAConfig } from '@bfc/shared';
import { Dropdown } from '@fluentui/react/lib/Dropdown';
import { TextField } from '@bfc/ui-shared';
import { ResponsiveMode } from '@fluentui/react/lib/utilities/decorators/withResponsiveMode';

import { Text, Tips, Links, nameRegex, LUIS_REGIONS } from '../../constants';
import { FieldConfig, useForm } from '../../hooks/useForm';
import { getReferredQnaFiles } from '../../utils/qnaUtil';
import { getLuisBuildLuFiles } from '../../utils/luUtil';
import { luFilesSelectorFamily, qnaFilesSelectorFamily, dialogsSelectorFamily } from '../../recoilModel';

// -------------------- Styles -------------------- //

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
  subscriptionKey?: string;
  qnaRegion?: string;
  endpointKey: string;
  authoringRegion: string;
  defaultLanguage: string;
  environment: string;
  endpoint: string;
  authoringEndpoint: string;
}

const validate = (value?: string) => {
  if (value != null && !nameRegex.test(value)) {
    return formatMessage('Spaces and special characters are not allowed. Use letters, numbers, -, or _.');
  }
};

interface IPublishDialogProps {
  botName: string;
  isOpen: boolean;
  config: IConfig;
  onDismiss: () => void;
  onPublish: (data: IPublishConfig) => void;
  projectId: string;
}

const PublishDialog: React.FC<IPublishDialogProps> = (props) => {
  const { isOpen, onDismiss, onPublish, botName, config, projectId } = props;
  const dialogs = useRecoilValue(dialogsSelectorFamily(projectId));
  const luFiles = useRecoilValue(luFilesSelectorFamily(projectId));
  const qnaFiles = useRecoilValue(qnaFilesSelectorFamily(projectId));
  const qnaConfigShow = getReferredQnaFiles(qnaFiles, dialogs).length > 0;
  const luConfigShow = getLuisBuildLuFiles(luFiles, dialogs).length > 0;

  const formConfig: FieldConfig<FormData> = {
    name: {
      required: true,
      validate,
      defaultValue: config.name || botName,
    },
    authoringKey: {
      required: luConfigShow,
      validate,
      defaultValue: config.authoringKey,
    },
    subscriptionKey: {
      required: qnaConfigShow,
      validate,
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
      validate,
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
      const publishConfig: IPublishConfig = {
        luis: newValue,
        qna: {
          subscriptionKey,
          qnaRegion,
          endpointKey: '',
        } as IQnAConfig,
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
          {formatMessage('Learn more')}
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
          {formatMessage('Learn more')}
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
        <Stack tokens={{ childrenGap: 20 }}>
          <TextField
            data-testid="ProjectNameInput"
            errorMessage={formErrors.name}
            label={formatMessage('What is the name of your bot?')}
            tooltip={Tips.PROJECT_NAME}
            value={formData.name}
            onChange={(_e, val) => updateField('name', val)}
          />
          <TextField
            data-testid="EnvironmentInput"
            errorMessage={formErrors.environment}
            label={formatMessage('Environment')}
            tooltip={Tips.ENVIRONMENT}
            value={formData.environment}
            onChange={(_e, val) => updateField('environment', val)}
          />
          {luConfigShow && (
            <Fragment>
              <TextField
                data-testid="AuthoringKeyInput"
                errorMessage={formErrors.authoringKey}
                label={formatMessage('LUIS authoring key:')}
                tooltip={Tips.AUTHORING_KEY}
                value={formData.authoringKey}
                onChange={(_e, val) => updateField('authoringKey', val)}
              />
              <Dropdown
                data-testid="regionDropdown"
                label={formatMessage('Luis authoring region')}
                options={LUIS_REGIONS}
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
                label={formatMessage('QnA Maker subscription key:')}
                tooltip={Tips.SUBSCRIPTION_KEY}
                value={formData.subscriptionKey}
                onChange={(_e, val) => updateField('subscriptionKey', val)}
              />
              <TextField
                disabled
                readOnly
                errorMessage={formErrors.qnaRegion}
                label={formatMessage('QnA region')}
                tooltip={Tips.AUTHORING_REGION}
                value={formData.qnaRegion}
              />
            </Fragment>
          )}
          <TextField
            disabled
            readOnly
            errorMessage={formErrors.defaultLanguage}
            label={formatMessage('Default language')}
            tooltip={Tips.DEFAULT_LANGUAGE}
            value={formData.defaultLanguage}
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

export { PublishDialog as _PublishDialog };
