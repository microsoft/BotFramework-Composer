/// <reference types="Cypress" />

context('Saving As', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
  });

  it('can create a new bot from an existing bot', () => {
    cy.createBot('ToDoBotWithLuisSample');
    cy.get('[data-testid="LeftNav-CommandBarButtonHome"]').click();
    cy.findByText('Save as').click();

    cy.get('input[data-testid="NewDialogName"]').type('__TestSaveAs');
    cy.get('input[data-testid="NewDialogName"]').type('{enter}');
    cy.wait(1000);

    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.findByText('__TestSaveAs.Main').should('exist');
      cy.findByText('ViewCollection').should('exist');
    });
  });
});
