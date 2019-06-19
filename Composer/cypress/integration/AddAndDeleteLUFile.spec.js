/// <reference types="Cypress" />

context('Add and Delete LU files and Navigate between Files', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL') + '/language-understanding');
  });

  it('can change url while navigating bettween LU files', () => {
    cy.getByText('Add new LU file').click();
    cy.get('input[data-testid="NewLUFile"]').type('__TestLUFile');
    cy.getByText('Add LU file').click();
    cy.getByText('__TestLUFile.lu').should('exist');
    cy.getByText('__TestLUFile.lu').click();
    cy.url().should('eq', Cypress.env('COMPOSER_URL') + '/language-understanding' + '/__TestLUFile');
    cy.getByText('Delete file').click();
    cy.getByText('Ok').click();
    cy.getByText('__TestLUFile.lu').not('exist');
  });
});
