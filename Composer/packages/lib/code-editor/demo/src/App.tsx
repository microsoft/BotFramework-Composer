import React, { useState } from 'react';

import { RichEditor } from '../../src';

const LU_HELP =
  'https://github.com/Microsoft/botbuilder-tools/blob/master/packages/Ludown/docs/lu-file-format.md#lu-file-format';

const content = `# Greeting
-Good morning
-Good afternoon
-Good evening`;

export default function App() {
  const [value, setValue] = useState<string>(content);
  const [showError, setShowError] = useState(true);

  const placeholder = `> To learn more about the LU file format, read the documentation at
> ${LU_HELP}`;
  const errorMsg = showError ? 'example error' : undefined;

  const codeRange = {
    startLineNumber: 2,
    endLineNumber: 3,
  };

  return (
    <div style={{ height: '99vh', width: '100%' }}>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => setShowError(!showError)}>Toggle Error</button>
      </div>
      <RichEditor
        onChange={newVal => setValue(newVal)}
        value={value}
        codeRange={codeRange}
        placeholder={placeholder}
        errorMsg={errorMsg}
        helpURL="https://dev.botframework.com"
        height={500}
      />
      <div style={{ border: '1px solid black' }}>bottom</div>
    </div>
  );
}
