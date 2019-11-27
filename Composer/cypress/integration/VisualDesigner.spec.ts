// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Visual Designer', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.createBot('TodoSample');
    // Return to Main.dialog
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('__TestTodoSample.Main').click();
    });
  });

  it('can find Visual Designer default trigger in container', () => {
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('Greeting').click();
    });

    cy.withinEditor('VisualEditor', () => {
      cy.findByText('Conversation started (ConversationUpdate)').should('exist');
    });
  });
});
