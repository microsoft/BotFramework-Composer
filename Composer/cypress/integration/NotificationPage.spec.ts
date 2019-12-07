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

    cy.get('.toggleEditMode button').as('switchButton');
    cy.get('@switchButton').click();
    cy.get('textarea').type('test lg syntax error');

    cy.visitPage('Notifications');

    cy.get('[data-testid="notifications-table-view"]').within(() => {
      cy.findAllByText('common.lg')
        .should('exist')
        .first()
        .click();
    });

    cy.findAllByText('Bot Responses').should('exist');
    cy.get('@switchButton').should('be.disabled');
  });

  it('can show lu syntax error ', () => {
    cy.visitPage('User Input');

    cy.get('.dialogNavTree button[title="__TestTodoSample.Main"]').click({ multiple: true });

    cy.get('.toggleEditMode button').click();
    cy.get('textarea').type('test lu syntax error');

    cy.visitPage('Notifications');

    cy.get('[data-testid="notifications-table-view"]').within(() => {
      cy.findAllByText('Main.lu')
        .should('exist')
        .first()
        .click();
    });

    cy.findAllByText('__TestTodoSample.Main').should('exist');
  });

  it('can show dialog expression error ', () => {
    cy.visitPage('Design Flow');

    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('Greeting').click();
    });

    cy.withinEditor('VisualEditor', () => {
      cy.findByText('Greeting').should('exist');
    });

    cy.withinEditor('FormEditor', () => {
      cy.findByText('Condition').should('exist');
      cy.get('.ObjectItem input').type('()');
    });

    cy.visitPage('Notifications');

    cy.get('[data-testid="notifications-table-view"]').within(() => {
      cy.findAllByText('Main.dialog')
        .should('exist')
        .first()
        .click();
    });

    cy.findAllByText('Greeting').should('exist');
  });
});
