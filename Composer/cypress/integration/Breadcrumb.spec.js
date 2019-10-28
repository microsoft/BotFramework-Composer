/// <reference types="Cypress" />

context('breadcrumb', () => {
  before(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.openBot('ToDoBot');
    cy.wait(100);
  });

  beforeEach(() => {
    // Return to Main.dialog
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.wait(1000);
      cy.getByText('ToDoBot.Main').click();
      cy.wait(1000);
    });
  });

  it('can show dialog name in breadcrumb', () => {
    // Should path = main dialog at first render
    cy.getByTestId('Breadcrumb')
      .invoke('text')
      .should('contain', 'ToDoBot.Main');

    // Click on AddToDo dialog
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.getByText('AddToDo').click();
    });
    cy.getByTestId('Breadcrumb')
      .invoke('text')
      .should('contain', 'AddToDo');

    // Return to Main.dialog
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.getByText('ToDoBot.Main').click();
      cy.wait(100);
    });

    cy.getByTestId('Breadcrumb')
      .invoke('text')
      .should('contain', 'ToDoBot');
  });

  it('can show event name in breadcrumb', () => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.getByText('AddToDo').click();
      cy.wait(100);
      cy.getByText('Handle an Event: BeginDialog').click();
      cy.wait(100);
    });

    cy.getByTestId('Breadcrumb')
      .invoke('text')
      .should('match', /AddToDo.*Handle an Event.*/);
  });

  it('can show action name in breadcrumb', () => {
    cy.wait(100);
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.getByText('Handle an Event: BeginDialog').click();
      cy.wait(500);
    });

    // Click on an action
    cy.withinEditor('VisualEditor', () => {
      cy.getByTestId('RuleEditor').within(() => {
        cy.getByText('Set a Property').click();
        cy.wait(500);
      });
    });

    cy.getByTestId('Breadcrumb')
      .invoke('text')
      .should('match', /ToDoBot.+Set a Property/);
  });
});
