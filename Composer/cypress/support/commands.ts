// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import '@testing-library/cypress/add-commands';

Cypress.Commands.add('createBot', (bobotId: string, botName?: string) => {
  cy.findByTestId('LeftNav-CommandBarButtonHome').click();
  cy.findByTestId('homePage-ToolBar-New').within(() => {
    cy.findByText('New').click();
  });
  cy.findByTestId('Create from template').click({ force: true });
  cy.findByTestId(`${bobotId}`).click({ force: true });
  cy.findByTestId('NextStepButton').click();
  cy.findByTestId('NewDialogName')
    .clear()
    .type(`__Test${botName || bobotId}`);
  cy.findByTestId('SubmitNewBotBtn').click();
  cy.url().should('match', /\/bot\/.*\/dialogs/);
});

Cypress.Commands.add('withinEditor', (editorName, cb) => {
  cy.findByTestId(editorName).within(cb);
});

Cypress.Commands.add('visitPage', page => {
  cy.findByTestId(`LeftNav-CommandBarButton${page}`).click();
  cy.findByTestId('ActiveLeftNavItem').should('contain', page);
});

Cypress.on('uncaught:exception', err => {
  // eslint-disable-next-line no-console
  console.log('uncaught exception', err);
  return false;
});
