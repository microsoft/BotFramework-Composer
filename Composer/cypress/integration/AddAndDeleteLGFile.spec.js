/// <reference types="Cypress" />

context('Add and Delete LG files and Navigate between Files', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL') + '/language-generation');
  });

  it('can change url while navigating bettween LG files', () => {
    cy.getByText('Add new LG file').click();
    cy.get('input[data-testid="NewLGFile"]').type('__TestLGFile');
    cy.getByText('Add LG file').click();
    cy.getByText('__TestLGFile.lg').should('exist');
    cy.getByText('__TestLGFile.lg').click();
    cy.url().should('eq', Cypress.env('COMPOSER_URL') + '/language-generation' + '/__TestLGFile');
    cy.getByText('Delete file').click();
    cy.getByText('Ok').click();
    cy.getByText('__TestLGFile.lg').not('exist');
  });
});
