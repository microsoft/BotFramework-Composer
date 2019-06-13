import React, { useState } from 'react';
import { LgEditor } from 'code-editor';
import * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';

import { BaseField } from './BaseField';

const focusEditor = (editor: Monaco.editor.IStandaloneCodeEditor | null) => {
  if (editor !== null) {
    editor.focus();
  }
};

export function EditorField(props) {
  const [value] = useState('');

  return (
    <div>
      <BaseField {...props} />
      <div style={{ height: '250px' }}>
        <LgEditor
          hidePlaceholder
          value={value}
          onChange={props.onChange}
          editorDidMount={editor => {
            focusEditor(editor);
          }}
        />
      </div>
    </div>
  );
}
