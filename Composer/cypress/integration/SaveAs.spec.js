/// <reference types="Cypress" />

context('Saving As', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
  });

  it('can create a new bot from an existing bot', () => {
    cy.openBot('ToDoLuisBot');
    cy.get('[data-testid="LeftNav-CommandBarButtonHome"]').click();
    cy.getByText('Save as').click();

    cy.get('input[data-testid="NewDialogName"]').type('__TestSaveAs');
    cy.get('input[data-testid="NewDialogName"]').type('{enter}');

    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.getByText('__TestSaveAs').should('exist');
      cy.getByText('ShowItems').should('exist');
    });
  });
});
