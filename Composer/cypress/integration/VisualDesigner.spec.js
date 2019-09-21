/// <reference types="Cypress" />

context('Visual Designer', () => {
  before(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.openBot('ToDoBot');
  });

  it('can find Visual Designer default trigger in container', () => {
    cy.withinEditor('VisualEditor', () => {
      cy.getByText('Trigger').should('exist');
    });
  });
});
