import React, { useState } from 'react';
import { LuEditor } from 'code-editor';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react';
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

const InlineLuEditor: React.FC<InlineLuEditorProps> = props => {
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

  const hasChanges = value !== file.content;

  return (
    <div>
      <div style={{ height: '40px', display: 'flex', justifyContent: 'flex-end' }}>
        <PrimaryButton
          iconProps={{ iconName: 'Save' }}
          onClick={commitChanges}
          disabled={!hasChanges}
          styles={{ root: { marginRight: '10px' } }}
        >
          {formatMessage('Save')}
        </PrimaryButton>
        <DefaultButton iconProps={{ iconName: 'Undo' }} onClick={discardChanges} disabled={!hasChanges}>
          {formatMessage('Discard changes')}
        </DefaultButton>
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
};

export default InlineLuEditor;
