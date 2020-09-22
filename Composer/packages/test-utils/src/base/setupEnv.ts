// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */

// try {
//   // Not all packages will require format-message, so just swallow the error
//   const formatMessage = require('format-message');

//   formatMessage.setup({
//     missingTranslation: 'ignore',
//   });
// } catch {
//   // ignore
// }

// eslint-disable-next-line no-console
const oldWarn = console.warn;
const oldError = console.error;

console.warn = (...args) => {
  if (args.some((msg) => msg.startsWith('Translation for'))) {
    return;
  }

  oldWarn(...args);
};

console.error = (...args) => {
  if (args.some((msg) => msg.startsWith('Warning: Cannot update a component'))) {
    return;
  }

  oldError(...args);
};
