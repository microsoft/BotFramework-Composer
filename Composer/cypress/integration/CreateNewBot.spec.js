/// <reference types="Cypress" />

context('Creating a new bot', () => {
  before(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.wait(500);
  });

  beforeEach(() => {
    cy.wait(500);
    cy.get('[data-testid="LeftNav-CommandBarButtonHome"]').click();
    cy.wait(500);
    cy.get('[data-testid="homePage-ToolBar-New"]').click();
    cy.wait(500);
  });

  it('can create a new bot', () => {
    cy.get('input[data-testid="Create from scratch"]').click();
    cy.wait(100);
    cy.get('button[data-testid="NextStepButton"]').click();
    cy.wait(100);
    cy.get('input[data-testid="NewDialogName"]').type('__TestNewProject');
    cy.get('input[data-testid="NewDialogName"]').type('{enter}');
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.getByText('__TestNewProject.Main').should('exist');
    });
  });

  it('can create a bot from the ToDo template', () => {
    cy.get('input[data-testid="Create from template"]').click({ force: true });
    cy.wait(100);
    cy.get('[data-testid="ToDoBot"]').click();
    cy.wait(100);
    cy.get('button[data-testid="NextStepButton"]').click();
    cy.wait(100);
    cy.get('input[data-testid="NewDialogName"]').type('__TestNewProject');
    cy.get('input[data-testid="NewDialogName"]').type('{enter}');
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.getByText('__TestNewProject.Main').should('exist');
      cy.getByText('AddToDo').should('exist');
      cy.getByText('ClearToDos').should('exist');
      cy.getByText('DeleteToDo').should('exist');
      cy.getByText('ShowToDos').should('exist');
    });
  });
});
