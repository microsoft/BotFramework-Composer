// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Saving As', () => {
  beforeEach(() => {
    cy.visit('/home');
    cy.createBot('EchoBot', 'TestBot');
  });

  it('can create a new bot from an existing bot', () => {
    cy.visitPage('Design');
    cy.findByTestId('LeftNav-CommandBarButtonHome').click();
    cy.url().should('contain', 'home');
    cy.findByText('Save as').click();
    cy.enterTextAndSubmit('NewDialogName', '__TestSaveAs', 'SubmitNewBotBtn');
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('__TestSaveAs').should('exist');
    });
  });
});
