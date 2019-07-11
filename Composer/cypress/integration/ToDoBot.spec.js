/// <reference types="Cypress" />

context('ToDo Bot', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.openBot('ToDoBot');
  });

  it('can open the main dialog', () => {
    cy.withinEditor('VisualEditor', () => {
      cy.getByText(/Hi! I'm a ToDo bot./).should('exist');
    });
    cy.withinEditor('FormEditor', () => {
      cy.getByText('Tasks').should('exist');
    });
  });

  it('can open the AddToDo dialog', () => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.get('[title="AddToDo"]').click();
    });
    cy.withinEditor('VisualEditor', () => {
      cy.getByText(/Successfully added a todo named/).should('exist');
    });
    cy.withinEditor('FormEditor', () => {
      cy.getByText('Steps').should('exist');
    });
  });

  it('can open the ClearToDos dialog', () => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.get('[title="ClearToDos"]').click();
    });
    cy.withinEditor('VisualEditor', () => {
      cy.getByText('Successfully cleared items in the Todo List.').should('exist');
    });
    cy.withinEditor('FormEditor', () => {
      cy.getByText('Microsoft.EditArray').should('exist');
    });
  });

  it('can open the DeleteToDo dialog', () => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.get('[title="DeleteToDo"]').click();
    });
    cy.withinEditor('VisualEditor', () => {
      cy.getByText('EditArray').should('exist');
    });
    cy.withinEditor('FormEditor', () => {
      cy.getByText('Microsoft.SetProperty').should('exist');
    });
  });

  it('can open the ShowToDos dialog', () => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.get('[title="ShowToDos"]').click();
    });
    cy.withinEditor('VisualEditor', () => {
      cy.getByText('You have no todos.').should('exist');
    });
    cy.withinEditor('FormEditor', () => {
      cy.getByText('Microsoft.IfCondition').should('exist');
    });
  });
});
