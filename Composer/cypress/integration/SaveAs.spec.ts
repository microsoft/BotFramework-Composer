// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Saving As', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.createBot('ToDoBotWithLuisSample');
  });

  it('can create a new bot from an existing bot', () => {
    cy.findByTestId('LeftNav-CommandBarButtonHome').click();
    cy.findByText('Save as').click();

    cy.findByTestId('NewDialogName').type('{selectall}__TestSaveAs{enter}');

    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('__TestSaveAs.Main').should('exist');
      cy.findByText('View').should('exist');
    });
  });
});
