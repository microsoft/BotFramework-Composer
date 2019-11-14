// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useMemo } from 'react';
import { LGLSPEditor } from '@bfc/code-editor/lib/LSPEditors/LGLSPEditor';
import get from 'lodash.get';
import debounce from 'lodash.debounce';

import { FormContext } from '../types';

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
      return template.Name === lgId;
    })) || {
    Name: lgId,
    Body: getInitialTemplate(name, value),
    Parameters: [],
    Range: {
      startLineNumber: 1,
      endLineNumber: 1,
    },
  };

  const [localValue, setLocalValue] = useState(template.Body);
  const lgOption = {
    inline: true,
    content: get(lgFile, 'content', ''),
    template,
  };

  const onChange = value => {
    setLocalValue(value);
    updateLgTemplate(value);
  };

  return (
    <LGLSPEditor
      onChange={onChange}
      value={localValue}
      lgOption={lgOption}
      errorMsg={errorMsg}
      hidePlaceholder={true}
      helpURL={LG_HELP}
      languageServer={{
        port: 5000,
        path: '/lgServer',
      }}
      height={height}
    />
  );
};
