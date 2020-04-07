// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Home Page ', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
  });

  it('can open buttons in home page', () => {
    cy.findByTestId('LeftNav-CommandBarButtonHome').click();
    cy.findByTestId('homePage-ToolBar-New').click();
    cy.findByText('Create bot from template or scratch?').should('exist');
    cy.findByText('Cancel').should('exist');
    cy.findByText('Cancel').click();
    cy.findByTestId('homePage-ToolBar-Open').click();
    cy.findByText('Select a Bot').should('exist');
    cy.findByText('Cancel').should('exist');
    cy.findByText('Cancel').click();
    cy.findByTestId('homePage-body-New').click();
    cy.findByText('Create bot from template or scratch?').should('exist');
  });
});
