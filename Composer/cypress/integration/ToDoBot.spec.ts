// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('ToDo Bot', () => {
  before(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.createBot('TodoSample');
    cy.wait(5000);
  });

  it('can open the main dialog', () => {
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('__TestTodoSample.Main').click();
    });
    cy.withinEditor('FormEditor', () => {
      cy.findByDisplayValue('__TestTodoSample').should('exist');
    });
  });

  it('can open the AddToDo dialog', () => {
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('AddToDo').click();
    });

    cy.withinEditor('FormEditor', () => {
      cy.findByDisplayValue('AddToDo').should('exist');
    });
  });

  it('can open the ClearToDos dialog', () => {
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('ClearToDos').click();
    });

    cy.withinEditor('FormEditor', () => {
      cy.findByDisplayValue('ClearToDos').should('exist');
    });
  });

  it('can open the DeleteToDo dialog', () => {
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('DeleteToDo').click();
    });

    cy.withinEditor('FormEditor', () => {
      cy.findByDisplayValue('DeleteToDo').should('exist');
    });
  });

  it('can open the ShowToDos dialog', () => {
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('ShowToDos').click();
    });

    cy.withinEditor('FormEditor', () => {
      cy.findByDisplayValue('ShowToDos').should('exist');
    });
  });
});
