import React, { useState } from 'react';

import { LGLSPEditorFile } from '../../src/LSPEditors/LGLSPEditor';
import { MonacoEditorCore } from '../../src/LSPEditors/MonacoEditorCore';
import { BaseEditorCore } from '../../src/LSPEditors/BaseEditorCore';
import { RichEditor } from '../../src/LSPEditors/RichEditor';
import { LGLSPEditor } from '../../src/LSPEditors/LGLSPEditor';

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

// export interface LGLSPEditorProps extends RichEditorProps {
//   fileInfo?: {
//     id?: 'string';
//     language?: 'string';
//     inline?: boolean;
//     content?: string;
//   };
// }

const options = {
  content,
};

export default function App() {
  const [value, setValue] = useState(content);

  const onChange = value => {
    setValue(value);
  };

  const props = {
    value,
    onChange,
  };
  return <LGLSPEditor {...props} />;
}
