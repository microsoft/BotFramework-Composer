import React, { useState } from 'react';
import { LuEditor } from 'code-editor';

import { LuFile } from '../../../types';

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
    <div style={{ height: '500px', padding: '0 18px', paddingBottom: errorMsg ? '19px' : 0 }}>
      <LuEditor value={content} onChange={commitChanges} errorMsg={errorMsg} />
    </div>
  );
};

export default InlineLuEditor;
