import React from 'react';
import { LgEditor } from 'code-editor';
import * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';

import { BaseField } from './BaseField';

const focusEditor = (editor: Monaco.editor.IStandaloneCodeEditor | null) => {
  if (editor !== null) {
    editor.focus();
  }
};

export function LgEditorField(props) {
  const onChange = data => {
    // find the template definition
    // replace its content with data
    if (data.length > 0 && data[0] !== '-') {
      props.formContext.shellApi.updateLgFile({
        id: 'main',
        content: `# ${props.name.charAt(0).toUpperCase() +
          props.name.slice(1)}-${props.formContext.getDialogId()}\n${data}`,
      });
    } else {
      props.formContext.shellApi.updateLgFile({
        id: 'main',
        content: `# ${props.name.charAt(0).toUpperCase() +
          props.name.slice(1)}-${props.formContext.getDialogId()}\n${data}`,
      });
    }
    props.onChange(`[${props.name.charAt(0).toUpperCase() + props.name.slice(1)}-${props.formContext.getDialogId()}]`);
  };

  const [lgContent] = props.formContext.lgFiles.filter(e => {
    return e.id === 'main';
  });

  const content = lgContent.content.replace(
    `# ${props.name.charAt(0).toUpperCase() + props.name.slice(1)}-${props.formContext.getDialogId()}\n`,
    ''
  );

  return (
    <div>
      <BaseField {...props} />
      <div style={{ height: '250px' }}>
        <LgEditor
          hidePlaceholder
          value={content}
          onChange={onChange}
          editorDidMount={editor => {
            focusEditor(editor);
          }}
        />
      </div>
    </div>
  );
}
