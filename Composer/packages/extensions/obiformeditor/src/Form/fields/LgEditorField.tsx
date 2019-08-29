import React from 'react';
import { useState, useEffect } from 'react';
import { RichEditor } from 'code-editor';
import * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';

import { BFDFieldProps } from '../types';

import { BaseField } from './BaseField';

const focusEditor = (editor: Monaco.editor.IStandaloneCodeEditor | null): void => {
  if (editor !== null) {
    editor.focus();
  }
};

const getInitialTemplate = (formData?: string): string => {
  let newTemplate = formData || '';

  if (newTemplate.indexOf('bfdactivity-') !== -1) {
    return '';
  } else if (newTemplate && !newTemplate.startsWith('-')) {
    newTemplate = `-${newTemplate}`;
  }

  return newTemplate;
};

export const LgEditorField: React.FC<BFDFieldProps> = props => {
  const { formContext } = props;
  const [templateToRender, setTemplateToRender] = useState({ Name: '', Body: '' });
  const lgId = `bfdactivity-${formContext.dialogId}`;
  const [errorMsg, setErrorMsg] = useState('');

  const ensureTemplate = async (newBody?: string): Promise<void> => {
    const templates = await formContext.shellApi.getLgTemplates('common');
    const template = templates.find(template => {
      return template.Name === lgId;
    });
    if (template === null || template === undefined) {
      const newTemplate = getInitialTemplate(newBody);

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
    ensureTemplate(props.formData);
  }, [formContext.dialogId]);

  const { Body } = templateToRender;
  return (
    <div>
      <BaseField {...props}>
        <div
          style={{
            height: '250px',
            paddingBottom: '19px',
          }}
        >
          <RichEditor
            editorDidMount={editor => {
              focusEditor(editor);
            }}
            errorMsg={errorMsg}
            value={Body}
            onChange={onChange}
          />
        </div>
      </BaseField>
    </div>
  );
};
