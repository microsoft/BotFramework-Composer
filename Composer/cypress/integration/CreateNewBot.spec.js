/// <reference types="Cypress" />

context('Creating a new bot', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
  });

  it('can create a new bot', () => {
    cy.get('[data-testid="LeftNav-CommandBarButtonHome"]').click();
    cy.get('[data-testid="homePage-ToolBar-New"]').click();
    cy.get('input[data-testid="Create from scratch"]').click();
    cy.get('button[data-testid="NextStepButton"]').click();
    cy.get('input[data-testid="NewDialogName"]').type('__TestNewProject');
    cy.get('input[data-testid="NewDialogName"]').type('{enter}');
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.getByText('__TestNewProject').should('exist');
    });
  });

  it('can create a bot from the ToDo template', () => {
    cy.get('[data-testid="homePage-ToolBar-New"]').click();
    cy.get('input[data-testid="Create from template"]').click({ force: true });
    cy.get('[data-testid="ToDoBot"]').click();
    cy.get('button[data-testid="NextStepButton"]').click();
    cy.get('input[data-testid="NewDialogName"]').type('__TestNewProject');
    cy.get('input[data-testid="NewDialogName"]').type('{enter}');
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.getByText('__TestNewProject').should('exist');
      cy.getByText('AddToDo').should('exist');
      cy.getByText('ClearToDos').should('exist');
      cy.getByText('DeleteToDo').should('exist');
      cy.getByText('ShowToDos').should('exist');
    });
  });
});
