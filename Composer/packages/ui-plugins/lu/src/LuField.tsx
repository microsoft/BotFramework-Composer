// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from 'react';
import { LuEditor } from '@bfc/code-editor';
import { FieldProps, useShellApi } from '@bfc/extension';
import { combineMessage } from '@bfc/indexers';

const LuField: React.FC<FieldProps<string>> = props => {
  const { onChange } = props;
  const { dialogId, luFiles, shellApi } = useShellApi();
  const [errorMsg, setErrorMsg] = useState('');

  const luFile = luFiles.find(f => f.id === dialogId);
  const [localValue, setLocalValue] = useState(luFile?.content || '');

  useEffect(() => {
    if (luFile && luFile.diagnostics.length > 0) {
      const msg = combineMessage(luFile.diagnostics);
      setErrorMsg(msg);
    } else {
      setErrorMsg('');
    }
  }, [luFile]);

  const commitChanges = newValue => {
    setLocalValue(newValue);
    if (luFile) {
      shellApi.updateLuFile({ id: luFile.id, content: newValue }).catch(setErrorMsg);
      onChange(luFile.id);
    }
  };

  if (!luFile) {
    return null;
  }

  return <LuEditor height={450} value={localValue} onChange={commitChanges} errorMessage={errorMsg} />;
};

export { LuField };
