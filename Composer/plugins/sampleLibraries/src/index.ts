// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export default async (composer: any): Promise<void> => {
  console.log('ADD AN ASSET TO THE LIBRARY');
  composer.addLibrary({
    name: 'bbutilitydialogs',
    description: 'helpful utility dialogs like getEmail and getPhone',
  });
};
