/// <reference types="Cypress" />
context('check Nav Expandion ', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
  });
  it('can open buttons in home page', () => {
    cy.get('[data-testid="LeftNav-CommandBarButtonHome"]').click();
    cy.get('[data-testid="homePage-ToolBar-New"]').click();
    cy.getByText('Create from scratch?').should('exist');
    cy.getByText('Cancel').should('exist');
    cy.getByText('Cancel').click();
    cy.get('[data-testid="homePage-ToolBar-Open"]').click();
    cy.getByText('Select a Bot').should('exist');
    cy.getByText('Cancel').should('exist');
    cy.getByText('Cancel').click();
    cy.get('[data-testid="homePage-body-New"]').click();
    cy.getByText('Create from scratch?').should('exist');
  });
});
