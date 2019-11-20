// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';

import { LgEditor } from '../../src';

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

export default function App() {
  const [value, setValue] = useState(template.Body);

  const onChange = value => {
    setValue(value);
  };

  const props = {
    value,
    onChange,
    lgOption,
    languageServer: {
      port: 5000,
      path: '/lgServer',
    },
  };
  return <LgEditor {...props} />;
}
