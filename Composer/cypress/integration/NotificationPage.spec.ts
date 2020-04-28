// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Notification Page', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.createBot('ToDoBotWithLuisSample');
    cy.visitPage('Notifications');
  });

  it('can show lg syntax error ', () => {
    cy.visitPage('Bot Responses');

    cy.get('.toggleEditMode button').as('switchButton');
    cy.get('@switchButton').click();
    cy.get('textarea').type('#');

    cy.get('[data-testid="notifications-info-button"]').click();

    cy.get('[data-testid="notifications-table-view"]').within(() => {
      cy.findAllByText('common.en-us.lg')
        .should('exist')
        .first()
        .click();
    });

    cy.findAllByText('Bot Responses').should('exist');
  });

  it('can show lu syntax error ', () => {
    cy.visitPage('User Input');

    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('__TestToDoBotWithLuisSample').click();
    });

    cy.get('.toggleEditMode button').click();
    cy.get('textarea').type('t');

    cy.get('[data-testid="notifications-info-button"]').click();

    cy.get('[data-testid="notifications-table-view"]').within(() => {
      cy.findAllByText('__testtodobotwithluissample.en-us.lu')
        .should('exist')
        .first()
        .dblclick();
    });

    cy.findAllByText('__TestToDoBotWithLuisSample').should('exist');
  });

  it('can show dialog expression error ', () => {
    cy.visitPage('Design Flow');

    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('WelcomeUser').click();
    });

    cy.withinEditor('VisualEditor', () => {
      cy.findByText('WelcomeUser').should('exist');
    });

    cy.withinEditor('PropertyEditor', () => {
      cy.findByText('Condition').should('exist');
      cy.findByTestId('expression-type-dropdown-Condition')
        .focus()
        .should('contain.text', 'expression');
      cy.get('#root\\.condition')
        .click()
        .type('()')
        .wait(1000);
    });

    cy.get('[data-testid="notifications-info-button"]').click();

    cy.get('[data-testid="notifications-table-view"]').within(() => {
      cy.findAllByText('__testtodobotwithluissample.dialog')
        .should('exist')
        .first()
        .dblclick();
    });

    cy.findAllByText('WelcomeUser').should('exist');
  });
});
