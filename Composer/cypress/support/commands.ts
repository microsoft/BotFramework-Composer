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
  cy.enterTextAndSubmit('NewDialogName', `__Test${botName || bobotId}`, 'SubmitNewBotBtn');
  cy.url().should('match', /\/bot\/.*\/dialogs/);
});

Cypress.Commands.add('withinEditor', (editorName, cb) => {
  cy.findByTestId(editorName).within(cb);
});

Cypress.Commands.add('visitPage', page => {
  cy.findByTestId(`LeftNav-CommandBarButton${page}`).click();
  cy.findByTestId('ActiveLeftNavItem').should('contain', page);
});

Cypress.Commands.add('enterTextAndSubmit', (textElement: string, text: string, submitBtn?: string) => {
  cy.findByTestId(textElement)
    .clear()
    .type(text);
  if (submitBtn) {
    cy.findByTestId(submitBtn).click();
  }
});

Cypress.on('uncaught:exception', err => {
  // eslint-disable-next-line no-console
  console.log('uncaught exception', err);
  return false;
});
