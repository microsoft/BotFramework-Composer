// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Visual Designer', () => {
  before(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.createBot('TodoSample');
  });

  beforeEach(() => {
    // Return to Main.dialog
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('__TestTodoSample.Main').click();
    });
  });

  it('can find Visual Designer default trigger in container', () => {
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('Greeting (ConversationUpdate)').click();
    });

    cy.withinEditor('VisualEditor', () => {
      cy.findByText('Trigger').should('exist');
    });
  });
});
