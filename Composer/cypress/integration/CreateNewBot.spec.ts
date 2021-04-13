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
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3000);
    cy.findByTestId('@microsoft/generator-bot-empty').click();
    cy.findByTestId('NextStepButton').click();
    cy.enterTextAndSubmit('NewDialogName', 'TestNewProject3', 'SubmitNewBotBtn');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(150000);
    cy.findByTestId('ProjectTree').within(() => {
      cy.findAllByText('TestNewProject3').should('exist');
    });
  });
});
