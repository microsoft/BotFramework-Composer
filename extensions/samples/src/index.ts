// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable security/detect-non-literal-fs-filename */

import path from 'path';

const boilerplateDir = path.resolve(__dirname, '../assets/shared');

function getBoilerplates() {
  return [
    {
      id: 'boilerplate',
      name: 'boilerplate',
      description: 'base template for every bot template',
      path: boilerplateDir,
      tags: ['boilerplate'],
      support: ['*'],
    },
  ];
}

const boilerplates = getBoilerplates();

export default async (composer: any): Promise<void> => {
  for (const template of boilerplates) {
    await composer.addBaseTemplate(template);
  }
};
