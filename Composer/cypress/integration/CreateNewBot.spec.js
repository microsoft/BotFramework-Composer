/// <reference types="Cypress" />

context('Creating a new bot', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.wait(1000);
    cy.get('[data-testid="LeftNav-CommandBarButtonHome"]').click();
    cy.wait(5000);
    cy.get('[data-testid="homePage-ToolBar-New"]').within(() => {
      cy.getByText('New').click();
    });
    cy.wait(5000);
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
    cy.get('[data-testid="TodoSample"]').click();
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
