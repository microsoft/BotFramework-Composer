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
  const [content, setContent] = useState(file.content || '');

  // save on mount to trigger validation
  useEffect(() => {
    if (content) {
      onSave(content);
    }
  }, []);

  const commitChanges = value => {
    setContent(value);
    onSave(value);
  };

  return <LuEditor value={content} onChange={commitChanges} errorMsg={errorMsg} height={450} />;
};

export default InlineLuEditor;
