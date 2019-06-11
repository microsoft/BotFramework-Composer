import React, { useState } from 'react';
import { LuEditor } from 'code-editor';
import { ActionButton } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';

import { LuFile } from '../../../types';

interface InlineLuEditorProps {
  file: LuFile;
  onSave: (newValue?: string) => void;
}

const focusEditor = (editor: Monaco.editor.IStandaloneCodeEditor | null) => {
  if (editor !== null) {
    editor.focus();
  }
};

export default function InlineLuEditor(props: InlineLuEditorProps) {
  const { file, onSave } = props;
  const [value, setValue] = useState(file.content || '');
  const [editorRef, setEditorRef] = useState<Monaco.editor.IStandaloneCodeEditor | null>(null);

  const commitChanges = () => {
    onSave(value);
    focusEditor(editorRef);
  };

  const discardChanges = () => {
    setValue(file.content);
    focusEditor(editorRef);
  };

  return (
    <div>
      <div style={{ height: '40px' }}>
        {value !== file.content && (
          <>
            <ActionButton iconProps={{ iconName: 'Save' }} split={true} onClick={commitChanges}>
              {formatMessage('Save file')}
            </ActionButton>
            <ActionButton iconProps={{ iconName: 'Undo' }} onClick={discardChanges}>
              {formatMessage('Discard changes')}
            </ActionButton>
          </>
        )}
      </div>
      <div style={{ height: '500px' }}>
        <LuEditor
          value={value}
          onChange={val => setValue(val)}
          editorDidMount={editor => {
            focusEditor(editor);
            setEditorRef(editor);
          }}
        />
      </div>
    </div>
  );
}
