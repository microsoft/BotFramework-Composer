// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import './commands';

after(() => {
  cy.wait(500);
  cy.exec('yarn test:integration:clean');
});
