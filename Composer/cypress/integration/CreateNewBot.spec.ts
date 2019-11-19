// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Creating a new bot', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.wait(1000);
    cy.findByTestId('LeftNav-CommandBarButtonHome').click();
    cy.findByTestId('homePage-ToolBar-New').within(() => {
      cy.findByText('New').click();
    });
    cy.wait(1000);
  });

  it('can create a new bot', () => {
    cy.findByTestId('Create from scratch').click();
    cy.findByTestId('NextStepButton').click();
    cy.findByTestId('NewDialogName').type('__TestNewProject');
    cy.findByTestId('NewDialogName').type('{enter}');
    cy.wait(100);
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('__TestNewProject.Main').should('exist');
    });
  });

  it('can create a bot from the ToDo template', () => {
    cy.findByTestId('Create from template').click();
    cy.findByTestId('TodoSample').click();
    cy.findByTestId('NextStepButton').click();
    cy.findByTestId('NewDialogName').type('__TestNewProject');
    cy.findByTestId('NewDialogName').type('{enter}');
    cy.wait(100);
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('__TestNewProject.Main').should('exist');
      cy.findByText('AddToDo').should('exist');
      cy.findByText('ClearToDos').should('exist');
      cy.findByText('DeleteToDo').should('exist');
      cy.findByText('ShowToDos').should('exist');
    });
  });
});
