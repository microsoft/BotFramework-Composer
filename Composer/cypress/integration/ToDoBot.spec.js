/// <reference types="Cypress" />

context('ToDo Bot', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.openBot('ToDoBot');
  });

  it('can open the main dialog', () => {
    cy.withinEditor('VisualEditor', () => {
      cy.getByText('Events (8)').should('exist');
    });
    cy.withinEditor('FormEditor', () => {
      cy.getByText('ToDoBot').should('exist');
    });
  });

  it('can open the AddToDo dialog', () => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.get('[title="AddToDo"]').click();
    });
    cy.withinEditor('FormEditor', () => {
      cy.getByText('AddToDo').should('exist');
    });
    cy.withinEditor('VisualEditor', () => {
      cy.getByText('Handle events: beginDialog').click();
      cy.wait(100);
      cy.getByText('5 actions').click();
      cy.wait(100);
      cy.getByText(/Successfully added a todo named/).should('exist');
    });
  });

  it('can open the ClearToDos dialog', () => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.get('[title="ClearToDos"]').click();
    });
    cy.withinEditor('FormEditor', () => {
      cy.getByText('ClearToDos').should('exist');
    });
    cy.withinEditor('VisualEditor', () => {
      cy.getByText('Handle events: beginDialog').click();
      cy.wait(100);
      cy.getByText('2 actions').click();
      cy.wait(100);
      cy.getByText(/Successfully cleared items/).should('exist');
    });
  });

  it('can open the DeleteToDo dialog', () => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.get('[title="DeleteToDo"]').click();
    });
    cy.withinEditor('FormEditor', () => {
      cy.getByText('DeleteToDo').should('exist');
    });
    cy.withinEditor('VisualEditor', () => {
      cy.getByText('Handle events: beginDialog').click();
      cy.wait(100);
      cy.getByText('4 actions').click();
      cy.wait(100);
      cy.getByText('Edit an Array Property').should('exist');
    });
  });

  it('can open the ShowToDos dialog', () => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.get('[title="ShowToDos"]').click();
    });
    cy.withinEditor('FormEditor', () => {
      cy.getByText('ShowToDos').should('exist');
    });
    cy.withinEditor('VisualEditor', () => {
      cy.getByText('Handle events: beginDialog').click();
      cy.wait(100);
      cy.getByText('1 action: Branch: If/Else').click();
      cy.wait(100);
      cy.getByText('You have no todos.').should('exist');
    });
  });
});
