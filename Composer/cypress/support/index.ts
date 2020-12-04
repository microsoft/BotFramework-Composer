// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import './commands';

beforeEach(() => {
  cy.exec('yarn test:integration:clean');
  window.localStorage.setItem('composer:userSettings', JSON.stringify({ telemetry: { allowDataCollection: false } }));
  window.localStorage.setItem('composer:OnboardingState', JSON.stringify({ complete: true }));
  window.sessionStorage.setItem('composer:ProjectIdCache', '');
});

after(() => {
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(500);
  cy.exec('yarn test:integration:clean');
});
