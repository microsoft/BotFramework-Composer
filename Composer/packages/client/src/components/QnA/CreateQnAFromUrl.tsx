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
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';

import { Locales } from '../../locales';

import { initializeLocales } from './utilities';
import {
  validateUrl,
  CreateQnAFromFormProps,
  CreateQnAFromUrlFormData,
  CreateQnAFromUrlFormDataErrors,
} from './constants';
import { textFieldUrl, warning, urlPairStyle, knowledgeBaseStyle, urlStackStyle, subText } from './styles';

const hasErrors = (errors: CreateQnAFromUrlFormDataErrors) => {
  return !!errors.name || errors.urls.some((e) => !!e);
};

export const CreateQnAFromUrl: React.FC<CreateQnAFromFormProps> = (props) => {
  const { onChange, dialogId, locales, defaultLocale, initialName } = props;

  const index = Locales.findIndex((l) => l.locale === locales[0]);
  const initialLanguage = index > -1 ? Locales[index].language : locales[0];
  const [formData, setFormData] = useState<CreateQnAFromUrlFormData>({
    urls: [],
    locales: initializeLocales(locales, defaultLocale),
    language: initialLanguage,
    name: initialName || '',
    multiTurn: false,
  });

  const [formDataErrors, setFormDataErrors] = useState<CreateQnAFromUrlFormDataErrors>({
    urls: [],
    name: '',
  });

  const usedLocales = useMemo(() => {
    return locales.map((fl) => {
      const index = Locales.findIndex((l) => l.locale === fl);
      if (index > -1) {
        return { text: Locales[index].language, locale: fl, key: fl };
      } else {
        return { text: fl, locale: fl, key: fl };
      }
    });
  }, [locales]);

  const isQnAFileselected = !(dialogId === 'all');

  const onChangeUrlsField = (value: string | undefined) => {
    const urls = [...formData.urls];
    urls[0] = value ?? '';
    updateUrlsField(urls);
    updateUrlsError(urls);
  };

  const onChangeMultiTurn = (value: boolean | undefined) => {
    setFormData({
      ...formData,
      multiTurn: value ?? false,
    });
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

  const onChangeLanguageField = (option) => {
    setFormData({
      ...formData,
      language: option.text,
      locales: [option.key],
    });
  };

  useEffect(() => {
    const disabled = hasErrors(formDataErrors) || !formData.urls[0] || !formData.name;
    onChange(formData, disabled);
  }, [formData, formDataErrors]);

  return (
    <Fragment>
      <Stack>
        <Text styles={knowledgeBaseStyle}>{formatMessage('Create new knowledge base from URL')}</Text>
        <p>
          <span css={subText}>
            {formatMessage(
              'Select this option if you want to create a knowledge base from content hosted online such as an FAQ or document link (.csv, .xls or .doc format)'
            )}
          </span>
        </p>
      </Stack>
      <Stack maxHeight={400} styles={urlStackStyle}>
        <Text styles={knowledgeBaseStyle}>{formatMessage('Source URL')}</Text>
        <div key={`add${formData.locales[0]}InCreateQnAFromUrlModal`} css={urlPairStyle}>
          <TextField
            data-testid={`add${formData.locales[0]}InCreateQnAFromUrlModal`}
            errorMessage={formDataErrors.urls[0]}
            placeholder={formatMessage('Enter a URL')}
            styles={textFieldUrl}
            value={formData.urls[0]}
            onChange={(e, url = '') => onChangeUrlsField(url)}
          />
        </div>
        <Dropdown
          label={formatMessage('What language is this content in?')}
          options={usedLocales}
          selectedKey={formData.locales[0]}
          styles={textFieldUrl}
          onChange={(_e, o) => {
            onChangeLanguageField(o);
          }}
        />

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
