// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';

export const validateDialogName = (name: string) => {
  const nameRegex = /^[a-zA-Z][a-zA-Z0-9-_]*$/;

  if (!name) {
    throw new Error(formatMessage('The file name can not be empty'));
  }

  if (!nameRegex.test(name)) {
    throw new Error(
      formatMessage(
        'Spaces and special characters are not allowed. Use letters, numbers, -, or _, and begin the name with a letter.'
      )
    );
  }
};
