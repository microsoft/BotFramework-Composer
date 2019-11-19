/// <reference types="Cypress" />

context('ToDo Bot', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.createBot('TodoSample');
  });

  it('can open the main dialog', () => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.findByText('__TestTodoSample.Main').click();
      cy.wait(100);
    });
    cy.withinEditor('FormEditor', () => {
      cy.findByDisplayValue('__TestTodoSample').should('exist');
    });
  });

  it('can open the AddToDo dialog', () => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.findByText('AddToDo').click();
      cy.wait(100);
    });

    cy.withinEditor('FormEditor', () => {
      cy.findByDisplayValue('AddToDo').should('exist');
    });
  });

  it('can open the ClearToDos dialog', () => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.findByText('ClearToDos').click();
      cy.wait(100);
    });

    cy.withinEditor('FormEditor', () => {
      cy.findByDisplayValue('ClearToDos').should('exist');
    });
  });

  it('can open the DeleteToDo dialog', () => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.findByText('DeleteToDo').click();
      cy.wait(100);
    });

    cy.withinEditor('FormEditor', () => {
      cy.findByDisplayValue('DeleteToDo').should('exist');
    });
  });

  it('can open the ShowToDos dialog', () => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.findByText('ShowToDos').click();
      cy.wait(100);
    });

    cy.withinEditor('FormEditor', () => {
      cy.findByDisplayValue('ShowToDos').should('exist');
    });
  });
});
