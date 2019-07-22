/// <reference types="Cypress" />

context('ToDo Bot', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.openBot('ToDoBot');
  });

  it('can open the main dialog', () => {
    cy.withinEditor('VisualEditor', () => {
      cy.getByText('Events (7)').should('exist');
    });
    cy.withinEditor('FormEditor', () => {
      cy.getByText('ToDoBot').should('exist');
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
      cy.getByText('AddToDo').should('exist');
    });
  });

  it('can open the ClearToDos dialog', () => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.get('[title="ClearToDos"]').click();
    });
    cy.withinEditor('VisualEditor', () => {
      cy.getByText(/Successfully cleared items/).should('exist');
    });
    cy.withinEditor('FormEditor', () => {
      cy.getByText('ClearToDos').should('exist');
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
      cy.getByText('DeleteToDo').should('exist');
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
      cy.getByText('ShowToDos').should('exist');
    });
  });
});
