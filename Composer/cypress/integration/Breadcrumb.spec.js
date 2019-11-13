/// <reference types="Cypress" />

context('breadcrumb', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.createBot('TodoSample');

    // Return to Main.dialog
    cy.findByTestId('ProjectTree').within(() => {
      cy.debug();
      cy.findByText('__TestTodoSample.Main').click();
    });
  });

  it('can show dialog name in breadcrumb', () => {
    // Should path = main dialog at first render
    cy.findByTestId('Breadcrumb').should('contain', '__TestTodoSample.Main');

    // Click on AddToDo dialog
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.findByText('AddToDo').click();
    });
    cy.findByTestId('Breadcrumb')
      .invoke('text')
      .should('contain', 'AddToDo');
    // Return to Main.dialog
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.findByText('__TestTodoSample.Main').click();
    });

    cy.findByTestId('Breadcrumb')
      .invoke('text')
      .should('contain', '__TestTodoSample');
  });

  it('can show event name in breadcrumb', () => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.findByText('AddToDo').click();
      cy.findByText('Dialog started (BeginDialog)').click();
    });

    cy.findByTestId('Breadcrumb')
      .invoke('text')
      .should('match', /AddToDo.*Dialog started (BeginDialog)*/);
  });

  it('can show action name in breadcrumb', () => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.findByText('Conversation started (ConversationUpdate)').click();
    });

    // Click on an action
    cy.withinEditor('VisualEditor', () => {
      cy.findByTestId('RuleEditor').within(() => {
        cy.findByText('Send a response').click();
      });
    });

    cy.findByTestId('Breadcrumb')
      .invoke('text')
      .should('match', /__TestTodoSample.Main.*Conversation started \(ConversationUpdate\).*Send a response/);
  });
});
