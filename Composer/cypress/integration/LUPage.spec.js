/// <reference types="Cypress" />

context('check language understanding page', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.openBot('ToDoLuisBot');
  });

  it('can open language understanding page', () => {
    cy.visit(Cypress.env('COMPOSER_URL') + '/language-understanding/ToDoLuis');
    cy.get('[data-testid="LUEditor"]').within(() => {
      cy.getByText('ToDoLuisBot.main.lu').should('exist');
    });
  });
});
