/// <reference types="Cypress" />

context('check language understanding page', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.openBot('ToDoLuisBot');
  });

  it('can open language understanding page', () => {
    cy.visit(Cypress.env('COMPOSER_URL') + '/language-understanding');

    // left nav tree
    cy.contains('ToDoLuisBot.main');
    cy.contains('All');

    cy.get('.toggleEditMode button').as('switchButton');

    // all multiple file, edit mode button is disabled.
    cy.get('@switchButton').should('be.disabled');

    // by default is table view
    cy.get('[data-testid="LUEditor"] [data-testid="table-view"]').should('exist');

    // nav to ToDoLuisBot.main dialog
    cy.get('.dialogNavTree button[title="ToDoLuisBot.main"]').click();
    cy.wait(300);

    // goto edit-mode
    cy.get('@switchButton').click();
    cy.get('[data-testid="LUEditor"] .monaco-editor').should('exist');

    // back to all table view
    cy.get('.dialogNavTree button[title="All"]').click();
    cy.get('[data-testid="LUEditor"] [data-testid="table-view"]').should('exist');
  });
});
