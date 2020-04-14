// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Saving As', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.createBot('EchoBot', 'TestBot');
  });

  it('can create a new bot from an existing bot', () => {
    cy.findByTestId('LeftNav-CommandBarButtonHome').click();
    cy.url().should('contain', 'home');
    cy.findByText('Save as').click();
    cy.url().should('contain', 'home/saveProject');

    cy.findByTestId('NewDialogName').type('{selectall}__TestSaveAs{enter}');
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('__TestSaveAs').should('exist');
    });
  });
});
