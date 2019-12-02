// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, Fragment } from 'react';

import { LgEditor } from '../../src';

const content = `# Greeting1
-Good morning

# Greeting2
-Good afternoon

# Greeting3
-Good evening
`;

function LGEditor() {
  const [value, setValue] = useState(content);

  const onChange = value => {
    setValue(value);
  };

  const props = {
    value,
    onChange,
    languageServer: {
      host: 'localhost:5000',
      path: '/lg-language-server',
    },
  };
  return <LgEditor {...props} />;
}

export default function App() {
  const [count, setCount] = useState(1);
  const editors = Array.from(Array(count).keys()).map(index => {
    return (
      <div style={{ width: '500px', height: '300px', float: 'left' }} key={index}>
        <LGEditor />
      </div>
    );
  });
  return (
    <Fragment>
      <button onClick={() => setCount(1)}>Reset</button>
      <button onClick={() => setCount(prevCount => prevCount + 1)}>add</button>
      <button onClick={() => setCount(prevCount => prevCount - 1)}>remove</button>
      <div>{editors}</div>
    </Fragment>
  );
}
