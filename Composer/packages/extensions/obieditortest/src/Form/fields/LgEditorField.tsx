import React from 'react';
import { useState, useEffect } from 'react';
import { LgEditor } from 'code-editor';
import * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { FieldProps } from '@bfdesigner/react-jsonschema-form';

import { BaseField } from './BaseField';

const focusEditor = (editor: Monaco.editor.IStandaloneCodeEditor | null) => {
  if (editor !== null) {
    editor.focus();
  }
};

export function LgEditorField(props: FieldProps) {
  const [templateToRender, setTemplateToRender] = useState({ Name: '', Body: '' });
  const lgId = `bfdactivity-${props.formContext.getDialogId()}`;

  const hasExistingTemplate = async () => {
    const templates = await props.formContext.shellApi.getLgTemplates('common');
    const [template] = templates.filter(template => {
      return template.name === lgId;
    });
    if (template === null || template === undefined) {
      if (props.formContext.getDialogId()) {
        props.formContext.shellApi.createLgTemplate('common', { Name: lgId, Body: '' }, -1);
        props.onChange(`[${lgId}]`);
      }
      setTemplateToRender({ Name: `# ${lgId}`, Body: '' });
    } else {
      if (templateToRender.Name === '') {
        setTemplateToRender({ Name: `# ${lgId}`, Body: template.body });
      }
    }
  };

  const onChange = data => {
    // hit the lg api and replace it's Body with data
    if (props.formContext.getDialogId()) {
      let dataToEmit = data.trim();
      if (dataToEmit.length > 0 && dataToEmit[0] !== '-') {
        dataToEmit = `-${dataToEmit}`;
      }
      setTemplateToRender({ Name: templateToRender.Name, Body: data });
      props.formContext.shellApi.updateLgTemplate('common', lgId, dataToEmit);
      props.onChange(`[${lgId}]`);
    }
  };

  useEffect(() => {
    hasExistingTemplate();
  }, []);

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
