import React from 'react';
import { useState, useEffect } from 'react';
import { LgEditor } from 'code-editor';
import * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';

import { BaseField } from './BaseField';

const focusEditor = (editor: Monaco.editor.IStandaloneCodeEditor | null) => {
  if (editor !== null) {
    editor.focus();
  }
};

export function LgEditorField(props) {
  const [template, setTemplate] = useState({ Name: '', Body: '' });
  const hasExistingTemplate = async () => {
    const templates = await props.formContext.shellApi.getLgTemplates('common');
    const [template] = templates.filter(template => {
      return template.name === `activity-${props.formContext.getDialogId()}`;
    });
    if (template === null || template === undefined) {
      if (props.formContext.getDialogId()) {
        props.formContext.shellApi.createLgTemplate(
          'common',
          { Name: `activity-${props.formContext.getDialogId()}`, Body: '' },
          -1
        );
        props.onChange(`[activity-${props.formContext.getDialogId()}]`);
      }
      setTemplate({ Name: `# activity-${props.formContext.getDialogId()}`, Body: '' });
    } else {
      setTemplate({ Name: `# activity-${props.formContext.getDialogId()}`, Body: template.body });
    }
  };

  const onChange = data => {
    // hit the lg api and replace it's Body with data
    if (props.formContext.getDialogId()) {
      let dataToEmit = data.trim();
      if (dataToEmit.length > 0 && dataToEmit[0] !== '-') {
        dataToEmit = `-${dataToEmit}`;
      }
      props.formContext.shellApi.updateLgTemplate('common', `activity-${props.formContext.getDialogId()}`, dataToEmit);
    }
  };

  useEffect(() => {
    hasExistingTemplate();
  }, []);

  const { Body } = template;

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
