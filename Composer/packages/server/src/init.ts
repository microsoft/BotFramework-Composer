// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { start } from './server';

start().catch((err) => {
  console.error('Error occurred while starting server: ', err);
});
