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

  const placeholder = `> To learn more about the LU file format, read the documentation at
  > ${LU_HELP}`;

  const codeRange = {
    startLineNumber: 1,
    endLineNumber: 2,
  };

  return (
    <div style={{ height: 'calc(100vh - 20px)', width: '100%' }}>
      <RichEditor onChange={newVal => setValue(newVal)} codeRange={codeRange} value={value} placeholder={placeholder} />
    </div>
  );
}
