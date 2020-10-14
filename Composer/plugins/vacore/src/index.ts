// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import path from 'path';

import formatMessage from 'format-message';

export default async (composer: any): Promise<void> => {
  if (process.env.VA_CREATION) {
    // register the base template which will appear in the new bot modal
    composer.addBotTemplate({
      id: 'va-core',
      name: formatMessage('VA Core'),
      description: formatMessage('The core of your new VA - ready to run, just add skills!'),
      path: path.resolve(__dirname, '../template'),
    });
  }
};
