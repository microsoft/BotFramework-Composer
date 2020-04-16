// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { start } from './server';

start()
  .then((_) => {
    console.log('Server started.');
  })
  .catch((err) => {
    console.error('Error occurred while starting server: ', err);
  });
