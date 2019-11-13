/// <reference types="Cypress" />
context('check Nav Expandion ', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
  });
  it('can open buttons in home page', () => {
    cy.get('[data-testid="LeftNav-CommandBarButtonHome"]').click();
    cy.get('[data-testid="homePage-ToolBar-New"]').click();
    cy.findByText('Create from scratch?').should('exist');
    cy.findByText('Cancel').should('exist');
    cy.findByText('Cancel').click();
    cy.get('[data-testid="homePage-ToolBar-Open"]').click();
    cy.findByText('Select a Bot').should('exist');
    cy.findByText('Cancel').should('exist');
    cy.findByText('Cancel').click();
    cy.get('[data-testid="homePage-body-New"]').click();
    cy.findByText('Create from scratch?').should('exist');
  });
});
