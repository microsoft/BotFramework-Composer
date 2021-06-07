// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';

import { colors } from '../../colors';
import { Locales } from '../../locales';
import { dispatcherState, onCreateQnAFromUrlDialogCompleteState } from '../../recoilModel';
import TelemetryClient from '../../telemetry/TelemetryClient';

import {
  knowledgeBaseSourceUrl,
  validateUrl,
  validateName,
  CreateQnAFromUrlModalProps,
  CreateQnAFromUrlFormData,
  CreateQnAFromUrlFormDataErrors,
} from './constants';
import {
  subText,
  styles,
  dialogWindow,
  textFieldUrl,
  textFieldKBNameFromUrl,
  warning,
  urlPairStyle,
  knowledgeBaseStyle,
  urlStackStyle,
} from './styles';

const DialogTitle = () => {
  return (
    <div>
      {formatMessage('Add QnA Maker knowledge base')}
      <p>
        <span css={subText}>
          {formatMessage('Use Azure QnA Maker to extract question-and-answer pairs from an online FAQ. ')}
          <Link href={knowledgeBaseSourceUrl} target={'_blank'}>
            {formatMessage('Learn more')}
          </Link>
        </span>
      </p>
    </div>
  );
};

const hasErrors = (errors: CreateQnAFromUrlFormDataErrors) => {
  return !!errors.name || errors.urls.some((e) => !!e);
};

const initializeLocales = (locales: string[], defaultLocale: string) => {
  const newLocales = [...locales];
  const index = newLocales.findIndex((l) => l === defaultLocale);
  if (index < 0) throw new Error(`default language ${defaultLocale} does not exist in languages`);
  newLocales.splice(index, 1);
  newLocales.sort();
  newLocales.unshift(defaultLocale);
  return newLocales;
};

export const CreateQnAFromUrlModal: React.FC<CreateQnAFromUrlModalProps> = (props) => {
  const {
    onDismiss,
    onSubmit,
    dialogId,
    projectId,
    qnaFiles,
    locales,
    defaultLocale,
    initialName,
    onUpdateInitialName,
  } = props;
  const actions = useRecoilValue(dispatcherState);
  const onComplete = useRecoilValue(onCreateQnAFromUrlDialogCompleteState(projectId));

  const [formData, setFormData] = useState<CreateQnAFromUrlFormData>({
    urls: [],
    locales: initializeLocales(locales, defaultLocale),
    name: initialName || '',
    multiTurn: false,
  });

  const [formDataErrors, setFormDataErrors] = useState<CreateQnAFromUrlFormDataErrors>({
    urls: [],
    name: '',
  });

  const usedLocales = useMemo(() => {
    return formData.locales.map((fl) => {
      const index = Locales.findIndex((l) => l.locale === fl);
      if (index > -1) {
        return Locales[index].language;
      }
    });
  }, [formData.locales]);

  const isQnAFileselected = !(dialogId === 'all');
  const disabled = hasErrors(formDataErrors) || !formData.urls[0] || !formData.name;
  const validFormDataName = validateName(qnaFiles);

  const onChangeNameField = (value: string | undefined) => {
    updateNameField(value);
    onUpdateInitialName?.(value ?? '');
    updateNameError(value);
  };

  const onChangeUrlsField = (value: string | undefined, index: number) => {
    const urls = [...formData.urls];
    urls[index] = value ?? '';
    updateUrlsField(urls);
    updateUrlsError(urls);
  };

  const onChangeMultiTurn = (value: boolean | undefined) => {
    setFormData({
      ...formData,
      multiTurn: value ?? false,
    });
  };

  const updateNameField = (value: string | undefined) => {
    setFormData({
      ...formData,
      name: value ?? '',
    });
  };

  const updateNameError = (value: string | undefined) => {
    const error = validFormDataName(value) as string;
    setFormDataErrors({ ...formDataErrors, name: error ?? '' });
  };

  const updateUrlsField = (urls: string[]) => {
    setFormData({
      ...formData,
      urls: urls,
    });
  };

  const updateUrlsError = (urls: string[]) => {
    const urlErrors = urls.map((url) => {
      return validateUrl(url);
    }) as string[];
    setFormDataErrors({ ...formDataErrors, urls: urlErrors });
  };

  const handleDismiss = () => {
    onDismiss?.();
    onUpdateInitialName?.('');
    actions.createQnAFromUrlDialogCancel({ projectId });
    TelemetryClient.track('AddNewKnowledgeBaseCanceled');
  };

  const removeEmptyUrls = (formData: CreateQnAFromUrlFormData) => {
    const urls: string[] = [];
    const locales: string[] = [];
    for (let i = 0; i < formData.urls.length; i++) {
      if (formData.urls[i]) {
        urls.push(formData.urls[i]);
        locales.push(formData.locales[i]);
      }
    }
    return {
      ...formData,
      locales,
      urls,
    };
  };

  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: <DialogTitle />,
        styles: styles.dialog,
      }}
      hidden={false}
      modalProps={{
        isBlocking: false,
        styles: styles.modalCreateFromUrl,
      }}
      onDismiss={handleDismiss}
    >
      <div css={dialogWindow}>
        <Stack maxHeight={400} styles={urlStackStyle}>
          <TextField
            required
            data-testid={`knowledgeLocationTextField-name`}
            errorMessage={formDataErrors.name}
            label={formatMessage('Knowledge base name')}
            placeholder={formatMessage('Type a name for this knowledge base')}
            styles={textFieldKBNameFromUrl}
            value={formData.name}
            onChange={(e, name) => onChangeNameField(name)}
          />
          <Text styles={knowledgeBaseStyle}>{formatMessage('FAQ website (source)')}</Text>
          {formData.locales.map((locale, i) => {
            return (
              <div key={`add${locale}InCreateQnAFromUrlModal`} css={urlPairStyle}>
                <TextField
                  data-testid={`add${locale}InCreateQnAFromUrlModal`}
                  errorMessage={formDataErrors.urls[i]}
                  label={usedLocales[i]}
                  placeholder={formatMessage('Type or paste URL')}
                  required={i === 0}
                  styles={textFieldUrl}
                  value={formData.urls[i]}
                  onChange={(e, url = '') => onChangeUrlsField(url, i)}
                />
              </div>
            );
          })}

          {!isQnAFileselected && (
            <div css={warning}> {formatMessage('Please select a specific qna file to import QnA')}</div>
          )}
        </Stack>
        <Stack>
          <Checkbox
            label={formatMessage('Enable multi-turn extraction')}
            onChange={(_e, val) => onChangeMultiTurn(val)}
          />
        </Stack>
      </div>
      <DialogFooter>
        <DefaultButton
          data-testid={'createKnowledgeBaseFromScratch'}
          styles={{ root: { float: 'left' } }}
          text={formatMessage('Create custom knowledge base')}
          theme={colors.fluentTheme}
          onClick={() => {
            // switch to create from scratch flow, pass onComplete callback.
            actions.createQnAFromScratchDialogBegin({ projectId, dialogId, onComplete: onComplete?.func });
          }}
        />
        <DefaultButton
          text={formatMessage('Cancel')}
          theme={colors.fluentTheme}
          onClick={() => {
            handleDismiss();
          }}
        />
        <PrimaryButton
          data-testid={'createKnowledgeBase'}
          disabled={disabled}
          text={formatMessage('Create')}
          theme={colors.fluentTheme}
          onClick={() => {
            if (hasErrors(formDataErrors)) {
              return;
            }
            onSubmit(removeEmptyUrls(formData));
            onUpdateInitialName?.('');
            TelemetryClient.track('AddNewKnowledgeBaseCompleted', { scratch: false });
          }}
        />
      </DialogFooter>
    </Dialog>
  );
};

export default CreateQnAFromUrlModal;
