// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable @typescript-eslint/no-var-requires */

beforeEach(() => {
  try {
    // Not all packages will require format-message, so just swallow the error
    const formatMessage = require('format-message');

    formatMessage.setup({
      missingTranslation: 'ignore',
    });
  } catch {
    // ignore
  }
});
