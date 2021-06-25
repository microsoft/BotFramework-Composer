// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useMemo, Fragment, useEffect } from 'react';
import formatMessage from 'format-message';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';

import { Locales } from '../../locales';

import { initializeLocales } from './utilities';
import {
  validateUrl,
  validateName,
  CreateQnAFromFormProps,
  CreateQnAFromUrlFormData,
  CreateQnAFromUrlFormDataErrors,
} from './constants';
import {
  textFieldUrl,
  textFieldKBNameFromUrl,
  warning,
  urlPairStyle,
  knowledgeBaseStyle,
  urlStackStyle,
  subText,
} from './styles';

const hasErrors = (errors: CreateQnAFromUrlFormDataErrors) => {
  return !!errors.name || errors.urls.some((e) => !!e);
};

export const CreateQnAFromUrl: React.FC<CreateQnAFromFormProps> = (props) => {
  const { onChange, dialogId, qnaFiles, locales, defaultLocale, initialName, onUpdateInitialName } = props;

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

  useEffect(() => {
    const disabled = hasErrors(formDataErrors) || !formData.urls[0] || !formData.name;
    onChange(formData, disabled);
  }, [formData, formDataErrors]);

  return (
    <Fragment>
      <Stack>
        <Text styles={knowledgeBaseStyle}>{formatMessage('Create new KB from URL or file')}</Text>
        <p>
          <span css={subText}>
            {formatMessage(
              'Select this option when you want to create a KB from  content such as an FAQ available online or in a file .csv, .xls or .doc format '
            )}
          </span>
        </p>
      </Stack>
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
                placeholder={formatMessage('Type or paste URL')}
                prefix={usedLocales[i]}
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
    </Fragment>
  );
};

export default CreateQnAFromUrl;
