// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useState } from 'react';
import * as monacoEditor from '@bfcomposer/monaco-editor/esm/vs/editor/editor.api';
import { FieldProps } from '@bfc/extension';
import { FieldLabel } from '@bfc/adaptive-form';

import { BaseEditor } from './BaseEditor';

const JsonEditor: React.FC<FieldProps> = props => {
  const { onChange, value, id, label, description } = props;
  const [localValue, setLocalValue] = useState(JSON.stringify(value, null, 4));
  const [invalid, setInvalid] = useState(false);

  const handleChange = (e: monacoEditor.editor.IModelContentChangedEvent, newValue?: string) => {
    setLocalValue(newValue || '');
    let parsed = undefined;

    if (newValue) {
      try {
        parsed = JSON.parse(newValue);
        setInvalid(false);
        onChange(parsed);
      } catch (err) {
        setInvalid(true);
      }
    }
  };

  return (
    <>
      <FieldLabel description={description} id={id} label={label} />
      <BaseEditor height="275px" invalid={invalid} language="json" value={localValue || ''} onChange={handleChange} />
    </>
  );
};

export { JsonEditor };
