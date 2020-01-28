// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('LU Page', () => {
  before(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.createBot('ToDoBotWithLuisSample');
  });

  it('can open language understanding page', () => {
    cy.findByTestId('LeftNav-CommandBarButtonUser Input').click();

    // left nav tree
    cy.contains('ToDoBotWithLuisSample.Main');
    cy.contains('All');

    cy.get('.toggleEditMode button').as('switchButton');

    // all multiple file, edit mode button is disabled.
    cy.get('@switchButton').should('be.disabled');

    // by default is table view
    cy.findByTestId('LUEditor')
      .findByTestId('table-view')
      .should('exist');

    // nav to ToDoBotWithLuisSample.main dialog
    cy.findByTestId('LUEditor').within(() => {
      cy.findByText('__TestToDoBotWithLuisSample.Main').click();
    });

    // goto edit-mode
    cy.get('@switchButton').click();
    cy.findByTestId('LUEditor')
      .get('.monaco-editor')
      .should('exist');

    // back to all table view
    cy.findByTestId('LUEditor').within(() => {
      cy.findByText('All').click();
    });
    cy.findByTestId('LUEditor')
      .findByTestId('table-view')
      .should('exist');
  });
});
