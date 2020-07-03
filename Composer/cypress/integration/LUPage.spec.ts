// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('LU Page', () => {
  beforeEach(() => {
    cy.visit('/home');
    cy.createBot('ToDoBotWithLuisSample');
  });

  it('can open language understanding page', () => {
    cy.findByTestId('LeftNav-CommandBarButtonUser Input').click();
    // left nav tree
    cy.contains('__TestToDoBotWithLuisSample');
    cy.contains('All');

    cy.get('.toggleEditMode button').should('not.exist');

    // by default it goes to table view
    cy.findByTestId('LUPage').findByTestId('table-view').should('exist');

    // move away from the User Input button (clicking the logo should do nothing)
    cy.findByAltText('Composer Logo').click();

    // nav to ToDoBotWithLuisSample.main dialog
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('__TestToDoBotWithLuisSample').click('left');
    });
    cy.get('.toggleEditMode button').as('switchButton');
    // goto edit-mode
    cy.get('@switchButton').click();
    cy.findByTestId('LUPage').get('.monaco-editor').should('exist');

    // back to all table view
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('All').click();
    });
    cy.findByTestId('LUPage').findByTestId('table-view').should('exist');
  });
});
