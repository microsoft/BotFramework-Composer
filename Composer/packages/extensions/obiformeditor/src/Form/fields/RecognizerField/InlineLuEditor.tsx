// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from 'react';
import { LuEditor } from '@bfc/code-editor';
import { LuFile } from '@bfc/shared';

interface InlineLuEditorProps {
  file: LuFile;
  onSave: (newValue?: string) => void;
  errorMsg: string;
}

const InlineLuEditor: React.FC<InlineLuEditorProps> = props => {
  const { file, onSave, errorMsg } = props;
  const [localContent, setLocalContent] = useState('');
  const [localErrorMsg, setLocalErrorMsg] = useState('');

  useEffect(() => {
    setLocalContent(file.content || '');
    const errorMsgText = file.diagnostics
      .map(item => {
        return item.text;
      })
      .join('\n');

    setLocalErrorMsg(errorMsgText || errorMsg || '');
  }, [file]);

  const commitChanges = value => {
    setLocalContent(value);
    onSave(value);
  };

  return <LuEditor value={localContent} onChange={commitChanges} errorMsg={localErrorMsg} height={450} />;
};

export default InlineLuEditor;
