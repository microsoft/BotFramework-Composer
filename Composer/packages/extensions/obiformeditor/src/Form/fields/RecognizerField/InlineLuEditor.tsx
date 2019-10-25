import React, { useState } from 'react';
import { LuEditor } from 'code-editor';
import { LuFile } from 'shared';

interface InlineLuEditorProps {
  file: LuFile;
  onSave: (newValue?: string) => void;
  errorMsg: string;
}

const InlineLuEditor: React.FC<InlineLuEditorProps> = props => {
  const { file, onSave, errorMsg } = props;
  const [content, setContent] = useState(file.content || '');

  const commitChanges = value => {
    setContent(value);
    onSave(value);
  };

  return (
    <div style={{ margin: '10px 0', padding: '0 18px' }}>
      <LuEditor value={content} onChange={commitChanges} errorMsg={errorMsg} height={450} />
    </div>
  );
};

export default InlineLuEditor;
