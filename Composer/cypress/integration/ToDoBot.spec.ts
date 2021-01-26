// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('ToDo Bot', () => {
  beforeEach(() => {
    window.localStorage.setItem('composer:userSettings', JSON.stringify({ telemetry: { allowDataCollection: false } }));
    cy.visit('/home');
    cy.createBot('TodoSample');
  });

  it('can open the main dialog', () => {
    cy.findByTestId('ProjectTree').within(() => {
      cy.findAllByText('__TestTodoSample').last().click();
    });
    cy.withinEditor('PropertyEditor', () => {
      cy.findAllByDisplayValue('__TestTodoSample').should('exist');
    });
  });

  it('can open the AddToDo dialog', () => {
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByTestId('addtodo_Dialog started').click();
    });

    cy.url().should('contain', 'addtodo');
  });

  it('can open the ClearToDos dialog', () => {
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByTestId('cleartodos_Dialog started').click();
    });

    cy.url().should('contain', 'cleartodos');
  });

  it('can open the DeleteToDo dialog', () => {
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByTestId('deletetodo_Dialog started').click();
    });

    cy.url().should('contain', 'deletetodo');
  });

  it('can open the ShowToDos dialog', () => {
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByTestId('showtodos_Dialog started').click();
    });

    cy.url().should('contain', 'showtodos');
  });
});
