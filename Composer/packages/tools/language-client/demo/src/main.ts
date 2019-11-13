// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import * as monaco from 'monaco-editor-core';

import '../../src/languages/lg.monaco.contribution';
import { startSampleClient } from '../../src/index';

const container: HTMLElement = document.getElementById('container') || document.body;

const content = `# Greeting1
-Good morning

# Greeting2
-Good afternoon

# Greeting3
-Good evening
`;

const lgServer = {
  url: 'ws://localhost:5000/lgServer',
};

const editor = monaco.editor.create(container, {
  value: content,
  glyphMargin: true,
  lightbulb: {
    enabled: true,
  },
  language: 'botbuilderlg',
  theme: 'lgtheme',
});

startSampleClient(editor, lgServer, {});
