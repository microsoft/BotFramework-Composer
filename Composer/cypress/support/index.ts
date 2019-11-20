// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import './commands';

beforeEach(() => {
  cy.exec('yarn test:integration:clean');
});

after(() => {
  cy.wait(500);
  cy.exec('yarn test:integration:clean');
});
