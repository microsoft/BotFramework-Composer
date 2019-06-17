/// <reference types="Cypress" />

context('Saving As', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
  });

  it('can create a new bot from an existing bot', () => {
    cy.openBot('07 - BeginDialog');
    cy.getByText('Save as').click();

    cy.get('input[data-testid="NewBotProjectInput"]').type('__TestSaveAs');
    cy.getByText('Save').click();
    // cy.get('input[data-testid="NewBotProjectInput"]').type('{enter}');

    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.getByText('__TestSaveAs.main').should('exist');
      cy.getByText('BeginDialog.FortuneTellerDialog').should('exist');
      cy.getByText('BeginDialog.TellJokeDialog').should('exist');
    });
  });
});
