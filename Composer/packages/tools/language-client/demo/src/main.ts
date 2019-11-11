// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { startSampleClient, registerLGLanguage } from '../../src/index';

const container = document.getElementById('container');

const content = `# Greeting1
-Good morning

# Greeting2
-Good afternoon

# Greeting3
-Good evening
`;

// const template = {
//   Name: 'Greeting2',
//   Body: `-Good afternoon
// -[Greeting3]
// -[Greeting4]`,
// };

const lgServer = {
  url: 'ws://localhost:5002/lgServer',
};

// const lgOption = {
//   inline: true,
//   content,
//   template,
// };

registerLGLanguage();

const editor = monaco.editor.create(container!, {
  value: content,
  glyphMargin: true,
  lightbulb: {
    enabled: true,
  },
  theme: 'lgtheme',
});

startSampleClient(editor, lgServer, {});
