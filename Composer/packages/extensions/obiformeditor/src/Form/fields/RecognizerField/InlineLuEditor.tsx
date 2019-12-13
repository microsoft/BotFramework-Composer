// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from 'react';
import { LuEditor } from '@bfc/code-editor';
import { LuFile } from '@bfc/indexers';

interface InlineLuEditorProps {
  file: LuFile;
  onSave: (newValue?: string) => void;
  errorMsg: string;
}

const InlineLuEditor: React.FC<InlineLuEditorProps> = props => {
  const { file, onSave, errorMsg } = props;
  const { content, diagnostics } = file;
  const [localContent, setLocalContent] = useState(content || '');

  const errorFromDiagnostics = diagnostics
    ? diagnostics
        .map(item => {
          return item.text;
        })
        .join('\n')
    : '';

  const [localErrorMsg, setLocalErrorMsg] = useState(errorFromDiagnostics);

  useEffect(() => {
    setLocalErrorMsg(errorMsg);
  }, [errorMsg]);

  const commitChanges = value => {
    setLocalContent(value);
    onSave(value);
  };

  return <LuEditor value={localContent} onChange={commitChanges} errorMsg={localErrorMsg} height={450} />;
};

export default InlineLuEditor;
