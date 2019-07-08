import React from 'react';
import { useState, useEffect } from 'react';
import { LgEditor } from 'code-editor';
import * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';

import { BFDFieldProps } from '../types';

import { BaseField } from './BaseField';

const focusEditor = (editor: Monaco.editor.IStandaloneCodeEditor | null) => {
  if (editor !== null) {
    editor.focus();
  }
};

const getInitialTemplate = (formData?: string): string => {
  let newTemplate = formData || '';

  if (newTemplate && !newTemplate.startsWith('-')) {
    newTemplate = `-${newTemplate}`;
  }

  return newTemplate;
};

export function LgEditorField(props: BFDFieldProps) {
  const { formContext } = props;

  const [templateToRender, setTemplateToRender] = useState({ Name: '', Body: '' });
  const lgId = `bfdactivity-${formContext.dialogId}`;

  const hasExistingTemplate = async () => {
    const templates = await formContext.shellApi.getLgTemplates('common');
    const template = templates.find(template => {
      return template.Name === lgId;
    });
    if (template === null || template === undefined) {
      const newTemplate = getInitialTemplate(props.formData);

      if (formContext.dialogId) {
        formContext.shellApi.createLgTemplate('common', { Name: lgId, Body: newTemplate }, -1);
        props.onChange(`[${lgId}]`);
      }
      setTemplateToRender({ Name: `# ${lgId}`, Body: newTemplate });
    } else {
      if (templateToRender.Name === '') {
        setTemplateToRender({ Name: `# ${lgId}`, Body: template.Body });
      }
    }
  };

  const onChange = data => {
    // hit the lg api and replace it's Body with data
    if (formContext.dialogId) {
      let dataToEmit = data.trim();
      if (dataToEmit.length > 0 && dataToEmit[0] !== '-') {
        dataToEmit = `-${dataToEmit}`;
      }
      setTemplateToRender({ Name: templateToRender.Name, Body: data });
      formContext.shellApi.updateLgTemplate('common', lgId, dataToEmit);
      props.onChange(`[${lgId}]`);
    }
  };

  useEffect(() => {
    hasExistingTemplate();
  }, [formContext.dialogId]);

  const { Body } = templateToRender;
  return (
    <div>
      <BaseField {...props} />
      <div style={{ height: '250px' }}>
        <LgEditor
          hidePlaceholder
          value={Body}
          onChange={onChange}
          editorDidMount={editor => {
            focusEditor(editor);
          }}
        />
      </div>
    </div>
  );
}
