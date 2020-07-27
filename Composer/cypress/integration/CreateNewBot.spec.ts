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
    cy.findByTestId('Create from scratch').click();
    cy.findByTestId('NextStepButton').click();
    cy.enterTextAndSubmit('NewDialogName', '__TestNewProject', 'SubmitNewBotBtn');
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('__TestNewProject').should('exist');
    });
  });

  it('can create a bot from the ToDo template', () => {
    cy.findByTestId('Create from template').click();
    cy.findByTestId('TodoSample').click({ force: true });
    cy.findByTestId('NextStepButton').click();
    cy.enterTextAndSubmit('NewDialogName', '__TestNewProject2', 'SubmitNewBotBtn');
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('__TestNewProject2').should('exist');
      cy.findByText('addtodo').should('exist');
      cy.findByText('cleartodos').should('exist');
      cy.findByText('deletetodo').should('exist');
      cy.findByText('showtodos').should('exist');
    });
  });
});
