/// <reference types="Cypress" />

context('Visual Designer', () => {
  before(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.openBot('ToDoBot');
  });

  it('can find Visual Designer default trigger in container', () => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.getByText('Handle ConversationUpdate').click();
      cy.wait(100);
    });
    cy.withinEditor('VisualEditor', () => {
      cy.getByText('Trigger').should('exist');
    });
  });
});
