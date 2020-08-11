// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Home Page ', () => {
  beforeEach(() => {
    cy.visit('/home');
  });

  it('can open buttons in home page', () => {
    cy.findByTestId('LeftNav-CommandBarButtonHome').click();
    cy.findByTestId('homePage-Toolbar-New').click();
    cy.findByText('Create bot from template or scratch?').should('exist');
    cy.findByText('Cancel').should('exist');
    cy.findByText('Cancel').click();
    cy.findByTestId('homePage-Toolbar-Open').click();
    cy.findByText('Select a Bot').should('exist');
    cy.findByText('Cancel').should('exist');
    cy.findByText('Cancel').click();
    cy.findByTestId('homePage-body-New').click();
    cy.findByText('Create bot from template or scratch?').should('exist');
  });
});
