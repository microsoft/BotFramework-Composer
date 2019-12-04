// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useMemo, useEffect } from 'react';
import { LgEditor } from '@bfc/code-editor';
import { LgMetaData, LgTemplateRef } from '@bfc/shared';
import get from 'lodash/get';
import debounce from 'lodash/debounce';

import { FormContext } from '../types';

const lspServerPort = process.env.NODE_ENV === 'production' ? process.env.PORT || 3000 : 5000;
const lspServerPath = '/lg-language-server';

const LG_HELP =
  'https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md';

const tryGetLgMetaDataType = (lgText: string): string | null => {
  const lgRef = LgTemplateRef.parse(lgText);
  if (lgRef === null) return null;

  const lgMetaData = LgMetaData.parse(lgRef.name);
  if (lgMetaData === null) return null;

  return lgMetaData.type;
};

const getInitialTemplate = (fieldName: string, formData?: string): string => {
  const lgText = formData || '';

  // Field content is already a ref created by composer.
  if (tryGetLgMetaDataType(lgText) === fieldName) {
    return '';
  }
  return lgText.startsWith('-') ? lgText : `- ${lgText}`;
};

interface LgEditorWidgetProps {
  formContext: FormContext;
  name: string;
  value?: string;
  height?: number | string;
  onChange: (template?: string) => void;
}

export const LgEditorWidget: React.FC<LgEditorWidgetProps> = props => {
  const { formContext, name, value, height = 250 } = props;
  const [errorMsg, setErrorMsg] = useState('');
  const lgName = new LgMetaData(name, formContext.dialogId || '').toString();
  const lgFileId = formContext.currentDialog.lgFile || 'common';
  const lgFile = formContext.lgFiles && formContext.lgFiles.find(file => file.id === lgFileId);

  const updateLgTemplate = useMemo(
    () =>
      debounce((body: string) => {
        formContext.shellApi
          .updateLgTemplate(lgFileId, lgName, body)
          .then(() => setErrorMsg(''))
          .catch(error => setErrorMsg(error));
      }, 500),
    [lgName, lgFileId]
  );

  const template = (lgFile &&
    lgFile.templates &&
    lgFile.templates.find(template => {
      return template.Name === lgName;
    })) || {
    Name: lgName,
    Body: getInitialTemplate(name, value),
  };

  const [localValue, setLocalValue] = useState(template.Body);
  const lgOption = {
    inline: true,
    content: get(lgFile, 'content', ''),
    template,
  };

  const onChange = (body: string) => {
    setLocalValue(body);
    if (formContext.dialogId) {
      if (body) {
        updateLgTemplate(body);
        props.onChange(new LgTemplateRef(lgName).toString());
      } else {
        updateLgTemplate.flush();
        formContext.shellApi.removeLgTemplate(lgFileId, lgName);
        props.onChange();
      }
    }
  };

  // update the template on mount to get validation
  useEffect(() => {
    if (localValue) {
      updateLgTemplate(localValue);
    }
  }, []);

  return (
    <LgEditor
      onChange={onChange}
      value={localValue}
      lgOption={lgOption}
      errorMsg={errorMsg}
      hidePlaceholder={true}
      helpURL={LG_HELP}
      languageServer={{
        port: Number(lspServerPort),
        path: lspServerPath,
      }}
      height={height}
    />
  );
};

export default LgEditorWidget;
