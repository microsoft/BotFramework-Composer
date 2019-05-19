/// <reference types="Cypress" />

context('ToDo Bot', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.openBot('ToDoBot');
  });

  it('can open the main dialog', () => {
    cy.withinEditor('VisualEditor', () => {
      cy.getByText('Welcome User').should('exist');
    });
    cy.withinEditor('FormEditor', () => {
      cy.getByText('Welcome User').should('exist');
    });
  });

  it('can open the AddToDo dialog', () => {
    cy.openDialog('AddToDo');
    cy.withinEditor('VisualEditor', () => {
      cy.getByText('Get Todo Title').should('exist');
      cy.getByText('Initialize Todos').should('exist');
      cy.getByText('Add To Todos').should('exist');
    });
    cy.withinEditor('FormEditor', () => {
      cy.getByText('Steps').should('exist');
    });
  });

  it('can open the ClearToDos dialog', () => {
    cy.openDialog('ClearToDos');
    cy.withinEditor('VisualEditor', () => {
      cy.getByText('Clear Todos').should('exist');
    });
    cy.withinEditor('FormEditor', () => {
      cy.getByText('Clear Todos').should('exist');
    });
  });

  it('can open the DeleteToDo dialog', () => {
    cy.openDialog('DeleteToDo');
    cy.withinEditor('VisualEditor', () => {
      cy.getByText('Remove').should('exist');
    });
    cy.withinEditor('FormEditor', () => {
      cy.getByText('Microsoft.DeleteProperty').should('exist');
    });
  });

  it('can open the ShowToDos dialog', () => {
    cy.openDialog('ShowToDos');
    cy.withinEditor('VisualEditor', () => {
      cy.getByText('[ShowTodo]').should('exist');
    });
    cy.withinEditor('FormEditor', () => {
      cy.getByText('Steps').should('exist');
    });
  });
});
