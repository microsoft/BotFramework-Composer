/// <reference types="Cypress" />

context('Visual Designer', () => {
  before(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.createBot('TodoSample');
    cy.wait(100);
  });

  beforeEach(() => {
    // Return to Main.dialog
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.getByText('__TestTodoSample.Main').click();
      cy.wait(100);
    });
  });

  it('can find Visual Designer default trigger in container', () => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.getByText('Conversation started (ConversationUpdate)').click();
      cy.wait(500);
    });

    cy.withinEditor('VisualEditor', () => {
      cy.getByText('Trigger').should('exist');
    });
  });
});
