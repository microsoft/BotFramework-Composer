import React from 'react';
import { LgLSPEditor, LGLSPEditorFile } from '../../src/LSPEditors/LGLSPEditor';

const content = `# Greeting1
-Good morning

# Greeting2
-Good afternoon

# Greeting3
-Good evening
`;

// Body will fill in editor
const template = {
  Name: 'Greeting2',
  Body: `-Good afternoon
-[Greeting3]
-[Greeting4]`,
};
// setting for inline LG template editor
const file: LGLSPEditorFile = {
  uri: 'inmemory://common.lg',
  language: 'botbuilderlg',
  inline: true,
  content,
  template,
};

export default function App() {
  return <LgLSPEditor file={file} height={250} />;
}
