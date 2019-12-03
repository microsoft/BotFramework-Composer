// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Notification Page', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.createBot('TodoSample');
    cy.visitPage('Notifications');
  });

  it('can show lg syntax error ', () => {
    cy.visitPage('Bot Responses');

    cy.get('.toggleEditMode button').click();
    cy.get('textarea').type('test lg syntax error');

    cy.visitPage('Notifications');

    cy.get('[data-testid="notifications-table-view"]').within(() => {
      cy.findAllByText('common.lg').should('exist');
    });
  });

  it('can show lu syntax error ', () => {
    cy.visitPage('User Input');

    cy.get('.dialogNavTree button[title="__TestTodoSample.Main"]').click({ multiple: true });

    cy.get('.toggleEditMode button').click();
    cy.get('textarea').type('test lu syntax error');

    cy.visitPage('Notifications');

    cy.get('[data-testid="notifications-table-view"]').within(() => {
      cy.findAllByText('Main.lu').should('exist');
    });
  });
});
