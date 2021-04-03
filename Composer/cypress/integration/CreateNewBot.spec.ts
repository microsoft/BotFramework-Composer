// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Creating a new bot', () => {
  beforeEach(() => {
    cy.visit('/home');
    cy.findByTestId('LeftNav-CommandBarButtonHome').click();
    cy.findByTestId('homePage-Toolbar-New').within(() => {
      cy.findByText('New').click();
    });
  });

  it('can create a new bot', () => {
    cy.findByTestId('@microsoft/generator-bot-empty').click();
    cy.findByTestId('NextStepButton').click();
    cy.enterTextAndSubmit('NewDialogName', '__TestNewProject', 'SubmitNewBotBtn');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(200000);
    cy.findByTestId('ProjectTree').within(() => {
      cy.findAllByText('__TestNewProject').should('exist');
    });
  });
});
