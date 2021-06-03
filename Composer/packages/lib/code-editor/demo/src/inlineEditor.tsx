// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';

import { LgCodeEditor } from '../../src';

import { mockTelemetryClient } from './mockTelemetryClient';

// body will fill in editor
const template = {
  name: 'Greeting',
  body: `-Good afternoon
-@{Exit()}
-@{Greeting4()}`,
};

const lgOption = {
  fileId: 'common',
  templateId: 'Greeting',
};

export default function App() {
  const [value, setValue] = useState(template.body);

  const onChange = (value) => {
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
  return <LgCodeEditor {...props} telemetryClient={mockTelemetryClient} />;
}
