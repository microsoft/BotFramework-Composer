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

// body will fill in editor
const template = {
  name: 'Greeting2',
  body: `-Good afternoon
-[Greeting3]
-[Greeting4]`,
};

const lgOption = {
  inline: true,
  content,
  template,
};

export default function App() {
  const [value, setValue] = useState(template.body);

  const onChange = value => {
    setValue(value);
  };

  const props = {
    value,
    onChange,
    lgOption,
    languageServer: {
      port: 5000,
      path: '/lg-language-server',
    },
  };
  return <LgEditor {...props} />;
}
