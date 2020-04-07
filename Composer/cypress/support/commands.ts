// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import '@testing-library/cypress/add-commands';

Cypress.Commands.add('createBot', (bobotId: string, botName?: string) => {
  cy.findByTestId('LeftNav-CommandBarButtonHome').click();
  cy.findByTestId('homePage-ToolBar-New').within(() => {
    cy.findByText('New').click();
  });
  cy.findByTestId('Create from template').click({ force: true });
  cy.findByTestId(`${bobotId}`).click();
  cy.findByTestId('NextStepButton').click();
  cy.findByTestId('NewDialogName').type(`{selectall}__Test${botName || bobotId}{enter}`);
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(1000);
});

Cypress.Commands.add('withinEditor', (editorName, cb) => {
  cy.findByTestId(editorName).within(cb);
});

Cypress.Commands.add('visitPage', page => {
  cy.findByTestId(`LeftNav-CommandBarButton${page}`).click();
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(3000);
});

Cypress.on('uncaught:exception', err => {
  // eslint-disable-next-line no-console
  console.log('uncaught exception', err);
  return false;
});
