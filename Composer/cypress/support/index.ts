// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import axios from 'axios';

import './commands';

beforeEach(() => {

  cy.exec('yarn test:integration:clean');
  window.localStorage.setItem('composer:OnboardingState', JSON.stringify({ complete: true }));
  window.sessionStorage.setItem('composer:ProjectIdCache', '');
  cy.request('post', '/api/settings', {
    settings: {
      telemetry: {
        allowDataCollection: false
      }
    }
  });
});

after(() => {
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(500);
  cy.exec('yarn test:integration:clean');
});
