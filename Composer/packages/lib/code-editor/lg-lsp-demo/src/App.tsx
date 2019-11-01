import React, { useState } from 'react';

import { RichEditor } from '../../src';
import { startSampleClient } from './client';

const content = `# Greeting
-Good morning
-Good afternoon
-Good evening`;

export default function App() {
  const [value, setValue] = useState<string>(content);

  const editorDidMount = editor => {
    console.log(editor);
    startSampleClient(editor);
  };
  return (
    <div style={{ height: '99vh', width: '100%' }}>
      <RichEditor
        onChange={newVal => setValue(newVal)}
        editorDidMount={editorDidMount}
        value={value}
        helpURL="https://dev.botframework.com"
        height={500}
      />
    </div>
  );
}
