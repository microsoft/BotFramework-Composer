import React from 'react';
import { useState, useEffect } from 'react';
import { RichEditor } from 'code-editor';

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
  const [templateToRender, setTemplateToRender] = useState({ Name: '', Body: '' });
  const lgId = `bfd${name}-${formContext.dialogId}`;
  const [errorMsg, setErrorMsg] = useState('');

  const ensureTemplate = async (newBody?: string): Promise<void> => {
    const templates = await formContext.shellApi.getLgTemplates('common');
    const template = templates.find(template => {
      return template.Name === lgId;
    });
    if (template === null || template === undefined) {
      const newTemplate = getInitialTemplate(name, newBody);

      if (formContext.dialogId && newTemplate) {
        formContext.shellApi.updateLgTemplate('common', lgId, newTemplate);
        props.onChange(`[${lgId}]`);
      }
      setTemplateToRender({ Name: `# ${lgId}`, Body: newTemplate });
    } else {
      if (templateToRender.Name === '') {
        setTemplateToRender({ Name: `# ${lgId}`, Body: template.Body });
      }
    }
  };

  const onChange = (data): void => {
    // hit the lg api and replace it's Body with data
    if (formContext.dialogId) {
      let dataToEmit = data.trim();
      if (dataToEmit.length > 0 && dataToEmit[0] !== '-') {
        dataToEmit = `-${dataToEmit}`;
      }

      if (dataToEmit.length > 0) {
        setTemplateToRender({ Name: templateToRender.Name, Body: data });
        formContext.shellApi
          .updateLgTemplate('common', lgId, dataToEmit)
          .then(() => setErrorMsg(''))
          .catch(error => setErrorMsg(error));
        props.onChange(`[${lgId}]`);
      } else {
        setTemplateToRender({ Name: templateToRender.Name, Body: '' });
        formContext.shellApi.removeLgTemplate('common', lgId);
        props.onChange(undefined);
      }
    }
  };

  useEffect(() => {
    ensureTemplate(value);
  }, [formContext.dialogId]);

  const { Body } = templateToRender;
  return <RichEditor errorMsg={errorMsg} value={Body} onChange={onChange} helpURL={LG_HELP} height={height} />;
};
