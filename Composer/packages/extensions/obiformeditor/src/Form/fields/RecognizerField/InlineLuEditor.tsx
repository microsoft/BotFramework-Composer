// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import { LuEditor } from '@bfc/code-editor';
import { LuFile } from '@bfc/shared';

interface InlineLuEditorProps {
  file: LuFile;
  onSave: (newValue?: string) => void;
  errorMsg: string;
}

const InlineLuEditor: React.FC<InlineLuEditorProps> = props => {
  const { file, onSave, errorMsg } = props;
  const { content } = file;
  const [localContent, setLocalContent] = useState(content || '');

  const commitChanges = value => {
    setLocalContent(value);
    onSave(value);
  };

  return <LuEditor value={localContent} onChange={commitChanges} errorMsg={errorMsg} height={450} />;
};

export default InlineLuEditor;
