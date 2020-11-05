// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';

import { LuEditor } from '../../src';

// body will fill in editor
const intent = {
  name: 'Greeting',
  body: `- hi
- hello
- hiya
- how are you?
- how do you do?`,
};

const luOption = {
  fileId: 'Main',
  sectionId: 'Greeting',
  luFeatures: {},
};

export default function App() {
  const [value, setValue] = useState(intent.body);

  const onChange = (value) => {
    setValue(value);
  };

  const props = {
    value,
    onChange,
    luOption,
    languageServer: {
      port: 5000,
      path: '/lu-language-server',
    },
  };
  return <LuEditor {...props} />;
}
