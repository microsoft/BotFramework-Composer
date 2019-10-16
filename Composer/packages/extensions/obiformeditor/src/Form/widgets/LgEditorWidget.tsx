import React from 'react';
import { useState } from 'react';
import { LgEditor } from 'code-editor';
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
  const lgId = `bfd${name}-${formContext.dialogId}`;
  const [errorMsg, setErrorMsg] = useState('');

  const lgFileId = formContext.currentDialog.lgFile || 'common';
  const lgFile = formContext.lgFiles.find(file => file.id === lgFileId);
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
    : -1;

  let content = lgFile ? lgFile.content : '';
  if (!template) {
    const newTemplateBody = getInitialTemplate(name, value || '-');
    content += ['\n', '# ' + lgId, newTemplateBody].join('\n');
  }

  const onChange = debounce((data): void => {
    // hit the lg api and replace it's Body with data
    if (formContext.dialogId) {
      formContext.shellApi
        .updateLgFile(lgFileId, data)
        .then(() => setErrorMsg(''))
        .catch(error => setErrorMsg(error));
      props.onChange(`[${lgId}]`);
    }
  }, 200);

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
