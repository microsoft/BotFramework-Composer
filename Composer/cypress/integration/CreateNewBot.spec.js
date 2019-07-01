/// <reference types="Cypress" />

context('Creating a new bot', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
  });

  it('can create a new bot', () => {
    cy.getByText('New').click();
    cy.get('input[aria-label="Create from scratch"]').click();
    cy.get('button[data-testid="NextStepButton"]').click();
    cy.get('input[data-testid="NewDialogName"]').type('__TestNewProject');
    cy.get('input[data-testid="NewDialogName"]').type('{enter}');
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.getByText('__TestNewProject').should('exist');
    });
  });

  it('can create a bot from the ToDo template', () => {
    cy.getByText('New').click();
    cy.get('input[aria-label="Create from templates"]').click();
    cy.get('input[aria-label="ToDoBot"]').click();
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
