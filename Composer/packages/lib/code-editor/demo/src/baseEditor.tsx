// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';

import { BaseEditor } from '../../src';

const LU_HELP = 'https://aka.ms/lu-file-format';

const content = `# Greeting
-Good morning
-Good afternoon
-Good evening`;

export default function App() {
  const [value, setValue] = useState<string>(content);
  const [showError, setShowError] = useState(true);
  const [showWarning, setShowWarning] = useState(false);

  const placeholder = `> To learn more about the LU file format, read the documentation at
> ${LU_HELP}`;
  const errorMsg = showError ? 'example error' : undefined;
  const warningMsg = showWarning ? 'example warning' : undefined;

  return (
    <div style={{ height: '99vh', width: '100%' }}>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => setShowError(!showError)}>Toggle Error</button>
        <button onClick={() => setShowWarning(!showWarning)}>Toggle Warning</button>
      </div>
      <BaseEditor
        onChange={newVal => setValue(newVal)}
        value={value}
        placeholder={placeholder}
        errorMsg={errorMsg}
        warningMsg={warningMsg}
        helpURL="https://dev.botframework.com"
        height={500}
      />
      <div style={{ border: '1px solid black' }}>bottom</div>
    </div>
  );
}
