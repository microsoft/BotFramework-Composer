/// <reference types="Cypress" />

context.skip('ToDo Bot', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.openBot('ToDoBot');
  });

  it('can open the main dialog', () => {
    cy.withinEditor('VisualEditor', () => {
      cy.getByText(/Hi! I'm a ToDo bot./).should('exist');
    });
    cy.withinEditor('FormEditor', () => {
      cy.getByText('Actions').should('exist');
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
      cy.getByText('Actions').should('exist');
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
      cy.getByText('Edit an Array Property').should('exist');
    });
  });

  it('can open the DeleteToDo dialog', () => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.get('[title="DeleteToDo"]').click();
    });
    cy.withinEditor('VisualEditor', () => {
      cy.getByText('Edit an Array Property').should('exist');
    });
    cy.withinEditor('FormEditor', () => {
      cy.getByText('Set a Property').should('exist');
    });
  });

  it.skip('can open the ShowToDos dialog', () => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.get('[title="ShowToDos"]').click();
    });
    cy.withinEditor('VisualEditor', () => {
      cy.getByText('You have no todos.').should('exist');
    });
    cy.withinEditor('FormEditor', () => {
      cy.getByText('Branch: If/Else').should('exist');
    });
  });
});
