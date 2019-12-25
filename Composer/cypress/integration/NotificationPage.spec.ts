// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Notification Page', () => {
  before(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.createBot('ToDoBotWithLuisSample');
  });

  beforeEach(() => {
    cy.visitPage('Notifications');
  });

  it('can show lg syntax error ', () => {
    cy.visit(Cypress.env('COMPOSER_URL'));
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
  });

  it('can show lu syntax error ', () => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.visitPage('User Input');

    cy.findByTestId('LUEditor').within(() => {
      cy.findByText('__TestToDoBotWithLuisSample.Main').click();
    });

    cy.get('.toggleEditMode button').click();
    cy.get('textarea').type('test lu syntax error');

    cy.visitPage('Notifications');

    cy.get('[data-testid="notifications-table-view"]').within(() => {
      cy.findAllByText('Main.lu')
        .should('exist')
        .first()
        .click();
    });

    cy.findAllByText('__TestToDoBotWithLuisSample.Main').should('exist');
  });

  it('can show dialog expression error ', () => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.visitPage('Design Flow');

    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('WelcomeUser').click();
    });

    cy.withinEditor('VisualEditor', () => {
      cy.findByText('WelcomeUser').should('exist');
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

    cy.findAllByText('WelcomeUser').should('exist');
  });
});
