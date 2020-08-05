// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('ToDo Bot', () => {
  beforeEach(() => {
    cy.visit('/home');
    cy.createBot('TodoSample');
  });

  it('can open the main dialog', () => {
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('__TestTodoSample').click();
    });
    cy.withinEditor('PropertyEditor', () => {
      cy.findByDisplayValue('__TestTodoSample').should('exist');
    });
  });

  it('can open the AddToDo dialog', () => {
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('addtodo').click();
      cy.findByTestId('addtodo_Dialog started').click();
    });

    cy.url().should('contain', 'addtodo');
  });

  it('can open the ClearToDos dialog', () => {
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('cleartodos').click();
      cy.findByTestId('cleartodos_Dialog started').click();
    });

    cy.url().should('contain', 'cleartodos');
  });

  it('can open the DeleteToDo dialog', () => {
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('deletetodo').click();
      cy.findByTestId('deletetodo_Dialog started').click();
    });

    cy.url().should('contain', 'deletetodo');
  });

  it('can open the ShowToDos dialog', () => {
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('showtodos').click();
      cy.findByTestId('showtodos_Dialog started').click();
    });

    cy.url().should('contain', 'showtodos');
  });
});
