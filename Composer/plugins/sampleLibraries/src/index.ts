// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export default async (composer: any): Promise<void> => {
  composer.addLibrary({
    name: 'benbrown/hackathon-dialogs',
    version: 'clean', // points to a specific branch
    description: 'helpful utility dialogs like getEmail and getPhone',
  });
};
