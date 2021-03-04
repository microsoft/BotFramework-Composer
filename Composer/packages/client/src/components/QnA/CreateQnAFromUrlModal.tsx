// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { PrimaryButton, DefaultButton, CommandButton, IconButton } from 'office-ui-fabric-react/lib/Button';
import { Link } from 'office-ui-fabric-react/lib/Link';

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
  textFieldLocales,
  textFieldKBName,
  warning,
  urlPairStyle,
} from './styles';

const DialogTitle = () => {
  return (
    <div>
      {formatMessage('Create new knowledge base')}
      <p>
        <span css={subText}>
          {formatMessage(
            'Extract question-and-answer pairs from an online FAQ, product manuals, or other files. Supported formats are .tsv, .pdf, .doc, .docx, .xlsx, containing questions and answers in sequence. '
          )}
          <Link href={knowledgeBaseSourceUrl} target={'_blank'}>
            {formatMessage('Learn more about knowledge base sources. ')}
          </Link>
        </span>
      </p>
    </div>
  );
};

const hasErrors = (errors: CreateQnAFromUrlFormDataErrors) => {
  for (let i = 0; i < errors.urls.length; i++) {
    if (errors.urls[i]) {
      return true;
    }
  }
  if (errors.name) {
    return true;
  }
  return false;
};

export const CreateQnAFromUrlModal: React.FC<CreateQnAFromUrlModalProps> = (props) => {
  const { onDismiss, onSubmit, dialogId, projectId, qnaFiles, locales, defaultLocale, activeLocale } = props;
  const actions = useRecoilValue(dispatcherState);
  const onComplete = useRecoilValue(onCreateQnAFromUrlDialogCompleteState(projectId));
  const [formData, setFormData] = useState<CreateQnAFromUrlFormData>({
    urls: [],
    locales: defaultLocale === activeLocale ? [defaultLocale] : [defaultLocale, activeLocale],
    name: '',
    multiTurn: false,
  });
  const [formDataErrors, setFormDataErrors] = useState<CreateQnAFromUrlFormDataErrors>({
    urls: [],
    name: '',
  });

  const isQnAFileselected = !(dialogId === 'all');
  const disabled = hasErrors(formDataErrors) || !formData.urls[0] || !formData.name;
  const addLocalesMenu = locales
    .filter((locale) => !formData.locales.includes(locale))
    .map((item) => {
      return {
        key: item,
        ariaLabel: item,
        text: item,
        onClick: () => addLocales(item),
      };
    });

  const validFormDataName = validateName(qnaFiles);

  const addLocales = (locale: string) => {
    setFormData({ ...formData, locales: [...formData.locales, locale] });
  };

  const onChangeNameField = (value: string | undefined) => {
    updateNameField(value);
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
    actions.createQnAFromUrlDialogCancel({ projectId });
    TelemetryClient.track('AddNewKnowledgeBaseCanceled');
  };

  const removeLocale = (locale) => {
    const locales = [...formData.locales];
    const index = locales.findIndex((l) => l === locale);
    if (index > -1) {
      locales.splice(index, 1);
      setFormData({ ...formData, locales });
    }
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
        styles: styles.modal,
      }}
      onDismiss={handleDismiss}
    >
      <div css={dialogWindow}>
        <Stack>
          <TextField
            required
            data-testid={`knowledgeLocationTextField-name`}
            errorMessage={formDataErrors.name}
            label={formatMessage('Knowledge base name')}
            placeholder={formatMessage('Type a name that describes this content')}
            styles={textFieldKBName}
            value={formData.name}
            onChange={(e, name = '') => onChangeNameField(name)}
          />
        </Stack>
        <Stack>
          <div css={urlPairStyle}>
            <TextField
              disabled
              data-testid={`defaultLocalesOnCreateQnAModal`}
              label={formatMessage('KB Languages')}
              styles={textFieldLocales}
              value={defaultLocale}
            />
            <TextField
              required
              data-testid={`knowledgeLocationTextField-url`}
              errorMessage={formDataErrors.urls[0]}
              label={formatMessage('Knowledge source')}
              placeholder={formatMessage('Enter a URL')}
              styles={textFieldUrl}
              value={formData.urls[0]}
              onChange={(e, url = '') => onChangeUrlsField(url, 0)}
            />
          </div>
          {defaultLocale !== activeLocale && (
            <div css={urlPairStyle}>
              <TextField
                disabled
                data-testid={`activeLocalesOnCreateQnAModal`}
                styles={textFieldLocales}
                value={activeLocale}
              />
              <TextField
                data-testid={`knowledgeLocationTextField-url`}
                errorMessage={formDataErrors.urls[1]}
                placeholder={formatMessage('Enter a URL')}
                styles={textFieldUrl}
                value={formData.urls[1]}
                onChange={(e, url = '') => onChangeUrlsField(url, 1)}
              />
            </div>
          )}
          {formData.locales
            .filter((locale) => {
              return locale !== defaultLocale && locale !== activeLocale;
            })
            .map((locale, index) => {
              const newIndex = index + (defaultLocale !== activeLocale ? 2 : 1);
              return (
                <div key={`add${locale}InCreateQnAFromUrlModal`} css={urlPairStyle}>
                  <TextField disabled styles={textFieldLocales} value={locale} />
                  <TextField
                    errorMessage={formDataErrors.urls[newIndex]}
                    placeholder={formatMessage('Enter a URL')}
                    styles={textFieldUrl}
                    value={formData.urls[newIndex]}
                    onChange={(e, url = '') => onChangeUrlsField(url, newIndex)}
                  />
                  <IconButton iconProps={{ iconName: 'Cancel' }} onClick={() => removeLocale(locale)} />
                </div>
              );
            })}

          {!isQnAFileselected && (
            <div css={warning}> {formatMessage('Please select a specific qna file to import QnA')}</div>
          )}
        </Stack>
        <Stack>
          <CommandButton
            data-is-focusable
            data-testid="AddLanguageButton"
            iconProps={{ iconName: 'Add' }}
            menuProps={{ items: addLocalesMenu }}
            text={formatMessage('Add')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.stopPropagation();
              }
            }}
          />
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
          text={formatMessage('Create knowledge base from scratch')}
          onClick={() => {
            // switch to create from scratch flow, pass onComplete callback.
            actions.createQnAFromScratchDialogBegin({ projectId, dialogId, onComplete: onComplete?.func });
          }}
        />
        <DefaultButton
          text={formatMessage('Cancel')}
          onClick={() => {
            handleDismiss();
          }}
        />
        <PrimaryButton
          data-testid={'createKnowledgeBase'}
          disabled={disabled}
          text={formatMessage('Create KB')}
          onClick={() => {
            if (hasErrors(formDataErrors)) {
              return;
            }
            onSubmit(removeEmptyUrls(formData));
            TelemetryClient.track('AddNewKnowledgeBaseCompleted', { scratch: false });
          }}
        />
      </DialogFooter>
    </Dialog>
  );
};

export default CreateQnAFromUrlModal;
