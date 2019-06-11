import React, { useState } from 'react';
import { LuEditor } from 'code-editor';
import { ActionButton } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import { LuFile } from '../../../types';

interface InlineLuEditorProps {
  file: LuFile;
  onSave: (newValue?: string) => void;
}

export default function InlineLuEditor(props: InlineLuEditorProps) {
  const { file, onSave } = props;
  const [value, setValue] = useState(file.content || '');

  const discardChanges = () => {
    setValue(file.content);
  };

  return (
    <div>
      <div style={{ height: '40px' }}>
        {value !== file.content && (
          <>
            <ActionButton iconProps={{ iconName: 'Save' }} split={true} onClick={() => onSave(value)}>
              {formatMessage('Save file')}
            </ActionButton>
            <ActionButton iconProps={{ iconName: 'Undo' }} onClick={discardChanges}>
              {formatMessage('Discard changes')}
            </ActionButton>
          </>
        )}
      </div>
      <div style={{ height: '500px' }}>
        <LuEditor value={value} onChange={val => setValue(val)} />
      </div>
    </div>
  );
}
