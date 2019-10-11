import React from 'react';
import { useState, useEffect } from 'react';
import { LgEditor } from 'code-editor';

import { FormContext } from '../types';

const LG_HELP =
  'https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md';

const getInitialTemplate = (fieldName: string, formData?: string): string => {
  let newTemplate = formData || '';

  if (newTemplate.indexOf(`bfd${fieldName}-`) !== -1) {
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

  const lgFileId = formContext.currentDialog.lgFile;
  const lgFile = formContext.lgFiles.find(file => file.id === lgFileId);
  const [content, setContent] = useState(lgFile ? lgFile.content : '');
  const template = lgFile
    ? lgFile.templates.find(template => {
        return template.Name === lgId;
      })
    : undefined;
  // template body code range
  const codeRange = template
    ? {
        startLineNumber: template.Range.startLineNumber + 1, // cut template name
        endLineNumber: template.Range.endLineNumber,
      }
    : undefined;

  useEffect(() => {
    // reset content with file.content's initial state
    setContent(lgFile ? lgFile.content : '');
  }, [lgId]);

  const ensureTemplate = async (newBody?: string): Promise<void> => {
    if (template === null || template === undefined) {
      const newTemplate = getInitialTemplate(newBody || '');

      if (formContext.dialogId && newTemplate) {
        formContext.shellApi.updateLgTemplate(lgFileId, lgId, newTemplate);
        props.onChange(`[${lgId}]`);
      }
    }
  };

  const onChange = (data): void => {
    // hit the lg api and replace it's Body with data
    if (formContext.dialogId) {
      const newContent = data.trim();
      formContext.shellApi
        .updateLgFile(lgFileId, newContent)
        .then(() => setErrorMsg(''))
        .catch(error => setErrorMsg(error));
      props.onChange(`[${lgId}]`);
    }
  };

  useEffect(() => {
    ensureTemplate(value);
  }, [formContext.dialogId]);

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
