/// <reference types="Cypress" />

context('check language generation page', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.openBot('ToDoBot');
  });

  it('can open language generation page', () => {
    cy.get('[data-testid="LeftNav-CommandBarButtonBot Says"]').click();
    // left nav tree
    cy.contains('ToDoBot');
    cy.contains('All');

    cy.get('.toggleEditMode button').as('switchButton');

    // by default is table view
    cy.get('[data-testid="LGEditor"] [data-testid="table-view"]').should('exist');
    // goto edit-mode
    cy.get('@switchButton').click();
    cy.get('[data-testid="LGEditor"] .monaco-editor').should('exist');

    // back to table view
    cy.get('@switchButton').click();

    // nav to Main dialog
    cy.get('.dialogNavTree button[title="ToDoBot"]').click();
    cy.wait(300);

    // dialog filter, edit mode button is disabled.
    cy.get('@switchButton').should('be.disabled');
  });
});
