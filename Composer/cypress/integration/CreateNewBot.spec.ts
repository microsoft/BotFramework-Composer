// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Creating a new bot', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.findByTestId('LeftNav-CommandBarButtonHome').click();
    cy.findByTestId('homePage-ToolBar-New').within(() => {
      cy.findByText('New').click();
    });
  });

  it('can create a new bot', () => {
    cy.findByTestId('Create from scratch').click();
    cy.findByTestId('NextStepButton').click();
    cy.findByTestId('NewDialogName').type('{selectall}__TestNewProject{enter}');
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('__TestNewProject.Main').should('exist');
    });
  });

  it('can create a bot from the ToDo template', () => {
    cy.findByTestId('Create from template').click();
    cy.findByTestId('TodoSample').click({ force: true });
    cy.findByTestId('NextStepButton').click();
    cy.findByTestId('NewDialogName').type('{selectall}__TestNewProject2{enter}');
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('__TestNewProject2.Main').should('exist');
      cy.findByText('addtodo').should('exist');
      cy.findByText('cleartodos').should('exist');
      cy.findByText('deletetodo').should('exist');
      cy.findByText('showtodos').should('exist');
    });
  });
});
