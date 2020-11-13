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

    cy.findByTestId('showcode').should('not.exist');

    // by default it goes to table view
    cy.findByTestId('LUPage').findByTestId('table-view').should('exist');

    // move away from the User Input button (clicking the logo should do nothing)
    cy.findByAltText('Composer Logo').click();

    // nav to ToDoBotWithLuisSample.main dialog
    cy.findByTestId('ProjectTree').within(() => {
      cy.findAllByText('__TestToDoBotWithLuisSample').last().click('left');
    });
    cy.findByTestId('showcode').as('switchButton');
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
