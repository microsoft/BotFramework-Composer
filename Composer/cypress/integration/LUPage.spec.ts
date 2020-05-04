// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('LU Page', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.createBot('ToDoBotWithLuisSample');
  });

  it('can open language understanding page', () => {
    cy.findByTestId('LeftNav-CommandBarButtonUser Input').click();
    // left nav tree
    cy.contains('__TestToDoBotWithLuisSample');
    cy.contains('All');

    cy.get('.toggleEditMode button').should('not.exist');

    // by default is table view
    cy.findByTestId('LUEditor')
      .findByTestId('table-view')
      .should('exist');

    // nav to ToDoBotWithLuisSample.main dialog
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('__TestToDoBotWithLuisSample').click();
    });
    cy.get('.toggleEditMode button').as('switchButton');
    // goto edit-mode
    cy.get('@switchButton').click();
    cy.findByTestId('LUEditor')
      .get('.monaco-editor')
      .should('exist');

    // back to all table view
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('All').click();
    });
    cy.findByTestId('LUEditor')
      .findByTestId('table-view')
      .should('exist');
  });
});
