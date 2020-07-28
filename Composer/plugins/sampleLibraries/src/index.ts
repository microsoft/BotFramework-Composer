// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export default async (composer: any): Promise<void> => {
  composer.addLibrary({
    name: 'benbrown/dialogs-getemail',
    version: 'main', // points to a specific branch
    category: 'Input Helpers',
    description: 'collect and validate an email address',
  });
  composer.addLibrary({
    name: 'benbrown/dialogs-getphone',
    version: 'main', // points to a specific branch
    category: 'Input Helpers',
    description: 'collect and validate a phone number',
  });
  composer.addLibrary({
    name: 'benbrown/dialogs-multiline',
    version: 'main', // points to a specific branch
    category: 'Input Helpers',
    description: 'collect multiple messages into a single field with a [DONE] button',
  });
};
