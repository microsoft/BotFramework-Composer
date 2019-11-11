// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, Fragment } from 'react';
import { editor } from 'monaco-editor-core';

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

const lgOption = {
  inline: true,
  content,
  template,
};

function LGEditor() {
  const [value, setValue] = useState(template.Body);

  const onChange = value => {
    setValue(value);
  };

  const props = {
    value,
    onChange,
    lgOption,
    languageServer: {
      url: 'ws://localhost:5000/lgServer',
    },
  };
  return <LGLSPEditor {...props} />;
}

export default function App() {
  const editor0 = <LGEditor />;
  const [editors, setEditors] = useState([editor0]);

  const increaseEditorInstance = () => {
    const img = [...editors];
    const newEditor = <LGEditor />;
    img.push(newEditor);
    setEditors(img);
  };
  const decreaseEditorInstance = () => {
    const img = [...editors];
    img.pop();
    setEditors(img);
  };

  const doms = editors.map((editor, index) => {
    return (
      <div style={{ width: '500px', height: '300px', float: 'left' }} key={index}>
        {editor}
      </div>
    );
  });
  return (
    <Fragment>
      <button onClick={increaseEditorInstance}>add</button>
      <button onClick={decreaseEditorInstance}>remove</button>
      <div>{doms}</div>
    </Fragment>
  );
}
