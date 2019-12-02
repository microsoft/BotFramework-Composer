// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useMemo } from 'react';
import { LgEditor } from '@bfc/code-editor';
import get from 'lodash/get';
import debounce from 'lodash/debounce';

import { FormContext } from '../types';

const lspServerPort = process.env.NODE_ENV === 'production' ? process.env.PORT || 3000 : 5000;
const lspServerPath = '/lg-language-server';

const LG_HELP =
  'https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md';

const getInitialTemplate = (fieldName: string, formData?: string): string => {
  let newTemplate = formData || '- ';

  if (newTemplate.includes(`bfd${fieldName}-`)) {
    return '';
  } else if (newTemplate && !newTemplate.startsWith('-')) {
    newTemplate = `-${newTemplate}`;
  }

  return newTemplate;
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
  const lgId = `bfd${name}-${formContext.dialogId}`;
  const lgFileId = formContext.currentDialog.lgFile || 'common';
  const lgFile = formContext.lgFiles && formContext.lgFiles.find(file => file.id === lgFileId);

  const updateLgTemplate = useMemo(
    () =>
      debounce((body: string) => {
        formContext.shellApi
          .updateLgTemplate(lgFileId, lgId, body)
          .then(() => setErrorMsg(''))
          .catch(error => setErrorMsg(error));
      }, 500),
    [lgId, lgFileId]
  );

  const template = (lgFile &&
    lgFile.templates &&
    lgFile.templates.find(template => {
      return template.name === lgId;
    })) || {
    name: lgId,
    body: getInitialTemplate(name, value),
  };

  const [localValue, setLocalValue] = useState(template.body);
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
        props.onChange(`[${lgId}]`);
      } else {
        updateLgTemplate.flush();
        formContext.shellApi.removeLgTemplate(lgFileId, lgId);
        props.onChange();
      }
    }
  };

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
