// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('ToDo Bot', () => {
  before(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.createBot('TodoSample');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000);
  });

  it('can open the main dialog', () => {
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('__TestTodoSample.Main').click();
    });
    cy.withinEditor('PropertyEditor', () => {
      cy.findByDisplayValue('__TestTodoSample').should('exist');
    });
  });

  it('can open the AddToDo dialog', () => {
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('addtodo').click();
    });

    cy.withinEditor('PropertyEditor', () => {
      cy.findByDisplayValue('addtodo').should('exist');
    });
  });

  it('can open the ClearToDos dialog', () => {
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('cleartodos').click();
    });

    cy.withinEditor('PropertyEditor', () => {
      cy.findByDisplayValue('cleartodos').should('exist');
    });
  });

  it('can open the DeleteToDo dialog', () => {
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('deletetodo').click();
    });

    cy.withinEditor('PropertyEditor', () => {
      cy.findByDisplayValue('deletetodo').should('exist');
    });
  });

  it('can open the ShowToDos dialog', () => {
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('showtodos').click();
    });

    cy.withinEditor('PropertyEditor', () => {
      cy.findByDisplayValue('showtodos').should('exist');
    });
  });
});
