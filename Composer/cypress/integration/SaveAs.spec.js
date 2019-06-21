/// <reference types="Cypress" />

context('Saving As', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
  });

  it('can create a new bot from an existing bot', () => {
    cy.openBot('ToDoLuisBot');
    cy.getByText('Save as').click();

    cy.get('input[data-testid="NewBotProjectInput"]').type('__TestSaveAs');
    cy.get('input[data-testid="NewBotProjectInput"]').type('{enter}');

    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.getByText('ToDoLuisBot.main').should('exist');
      cy.getByText('ToDoLuisBot.ShowItems').should('exist');
    });
  });
});
