import React from 'react';
import { useState } from 'react';
import { LgEditor } from 'code-editor';

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
  const lgId = `bfd${name}-${formContext.dialogId}`;
  const [errorMsg, setErrorMsg] = useState('');

  const lgFileId = formContext.currentDialog.lgFile || 'common';
  const lgFile = formContext.lgFiles.find(file => file.id === lgFileId);
  const template = (lgFile &&
    lgFile.templates.find(template => {
      return template.Name === lgId;
    })) || {
    Name: lgId,
    Body: getInitialTemplate(name, value),
    Parameters: '',
    Range: {
      startLineNumber: 1,
      endLineNumber: 1,
    },
  };

  // template body code range
  const codeRange = {
    startLineNumber: 2,
    endLineNumber: template.Body.split('\n').length + 1,
  };

  const [localContent, setLocalContent] = useState(template.Body);
  const content = `#${template.Name}\n${localContent}`;

  const onChange = (newTemplate: string) => {
    const body = newTemplate.slice(newTemplate.indexOf('\n') + 1);
    if (formContext.dialogId) {
      if (body) {
        formContext.shellApi
          .updateLgTemplate(lgFileId, lgId, body)
          .then(() => setErrorMsg(''))
          .catch(error => setErrorMsg(error));
      } else {
        formContext.shellApi.removeLgTemplate(lgFileId, lgId);
      }
      props.onChange(`[${lgId}]`);
    }
    setLocalContent(body);
  };

  return (
    <LgEditor
      codeRange={codeRange}
      errorMsg={errorMsg}
      value={content}
      onChange={onChange}
      helpURL={LG_HELP}
      height={height}
    />
  );
};
