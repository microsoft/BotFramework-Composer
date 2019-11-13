// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, Fragment } from 'react';

import { LGLSPEditor } from '../../src';

const content = `# Greeting1
-Good morning

# Greeting2
-Good afternoon

# Greeting3
-Good evening
`;

function LGEditor() {
  // const [value, setValue] = useState(template.Body);
  const [value, setValue] = useState(content);

  const onChange = value => {
    setValue(value);
  };

  const props = {
    value,
    onChange,
    languageServer: {
      host: 'localhost:5000',
      path: '/lgServer',
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
