/// <reference types="Cypress" />

context('ToDo Bot', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.openBot('ToDoBot');
  });

  it('can open the main dialog', () => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.getByText('ToDoBot.Main').click();
    });
    cy.withinEditor('FormEditor', () => {
      cy.getByDisplayValue('ToDoBot.Main').should('exist');
    });
  });

  it('can open the AddToDo dialog', () => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.getByText('AddToDo').click();
      cy.wait(100);
    });

    cy.withinEditor('FormEditor', () => {
      cy.getByDisplayValue('AddToDo').should('exist');
    });

    cy.withinEditor('VisualEditor', () => {
      cy.getByText(/Successfully added a todo named/).should('exist');
    });
  });

  it('can open the ClearToDos dialog', () => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.getByText('ClearToDos').click();
    });

    cy.withinEditor('FormEditor', () => {
      cy.getByDisplayValue('ClearToDos').should('exist');
    });
    cy.withinEditor('VisualEditor', () => {
      cy.getByText(/Successfully cleared items/).should('exist');
    });
  });

  it('can open the DeleteToDo dialog', () => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.getByText('DeleteToDo').click();
    });

    cy.withinEditor('FormEditor', () => {
      cy.getByDisplayValue('DeleteToDo').should('exist');
    });
    cy.withinEditor('VisualEditor', () => {
      cy.getByText('Edit an Array Property').should('exist');
    });
  });

  it('can open the ShowToDos dialog', () => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.getByText('ShowToDos').click();
    });

    cy.withinEditor('FormEditor', () => {
      cy.getByDisplayValue('ShowToDos').should('exist');
    });
    cy.withinEditor('VisualEditor', () => {
      cy.getByText('You have no todos.').should('exist');
    });
  });
});
