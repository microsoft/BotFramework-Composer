// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import path from 'path';

export default async (composer: any): Promise<void> => {
  if (process.env.VA_CREATION) {
    // register the base template which will appear in the NEw Bot modal
    composer.addBotTemplate({
      id: 'vaCore',
      name: 'VA Core',
      description: 'The core of your new VA - ready to run, just add skills!',
      path: path.resolve(__dirname, '../template'),
    });
  }
};
