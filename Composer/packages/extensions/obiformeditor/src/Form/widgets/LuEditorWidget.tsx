// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useMemo, useEffect } from 'react';
import { LuEditor } from '@bfc/code-editor';
import debounce from 'lodash/debounce';
import { LuIntentSection } from '@bfc/shared';
import { LuFile, filterSectionDiagnostics } from '@bfc/indexers';

import { FormContext } from '../types';

interface LuEditorWidgetProps {
  formContext: FormContext;
  name: string;
  height?: number | string;
  onChange: (template?: string) => void;
}

export const LuEditorWidget: React.FC<LuEditorWidgetProps> = props => {
  const { formContext, name, height = 250 } = props;
  const luFileId = formContext.currentDialog.id;
  const luFile: LuFile | null = formContext.luFiles.find(f => f.id === luFileId);
  const luIntent: LuIntentSection = (luFile && luFile.intents.find(intent => intent.Name === name)) || {
    Name: name,
    Body: '',
  };

  const updateLuIntent = useMemo(
    () =>
      debounce((body: string) => {
        formContext.shellApi.updateLuIntent(luFileId, name, { Name: name, Body: body }).catch(() => {});
      }, 500),
    [name, luFileId]
  );

  const diagnostic = luFile && filterSectionDiagnostics(luFile.diagnostics, luIntent)[0];

  const errorMsg = diagnostic
    ? diagnostic.message.split('error message: ')[diagnostic.message.split('error message: ').length - 1]
    : '';

  const [localValue, setLocalValue] = useState(luIntent.Body);

  // updating localValue when getting newest luIntent Data
  // it will be deleted after leilei's pr: fix: Undo / redo behavior on LG resources
  useEffect(() => {
    if (!localValue) {
      setLocalValue(luIntent.Body);
    }
  }, [luIntent.Body]);
  const onChange = (body: string) => {
    setLocalValue(body);
    if (luFileId) {
      if (body) {
        updateLuIntent(body);
      } else {
        updateLuIntent.flush();
        formContext.shellApi.removeLuIntent(luFileId, name);
      }
    }
  };

  // update the template on mount to get validation
  useEffect(() => {
    if (localValue) {
      updateLuIntent(localValue);
    }
  }, []);

  return <LuEditor onChange={onChange} value={localValue} errorMsg={errorMsg} hidePlaceholder={true} height={height} />;
};

export default LuEditorWidget;
