// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from 'react';
import { LuEditor } from '@bfc/code-editor';
import { LuFile, combineMessage } from '@bfc/indexers';

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
    const errorMsgText = combineMessage(file.diagnostics);

    setLocalErrorMsg(errorMsgText || errorMsg || '');
  }, [file]);

  const commitChanges = value => {
    setLocalContent(value);
    onSave(value);
  };

  return <LuEditor value={localContent} onChange={commitChanges} errorMsg={localErrorMsg} height={450} />;
};

export default InlineLuEditor;
