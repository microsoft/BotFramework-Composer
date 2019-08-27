/// <reference types="Cypress" />

context('breadcrumb', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.openBot('ToDoBot');
  });

  it('can show dialog name in breadcrumb', () => {
    cy.getByTestId('Breadcrumb')
      .invoke('text')
      .should('equal', 'ToDoBot.Main');

    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.getByText('AddToDo').click();
    });

    cy.getByTestId('Breadcrumb')
      .invoke('text')
      .should('equal', 'AddToDo');

    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.getByText('ToDoBot.Main').click();
    });

    cy.withinEditor('VisualEditor', () => {
      cy.getByText('AddIntent').click();
      cy.wait(100);
      cy.getByTestId('RuleEditor').within(() => {
        cy.getByText('AddToDo').click();
      });
    });

    cy.getByTestId('Breadcrumb')
      .invoke('text')
      .should('match', /ToDoBot.+AddToDo/);
  });
});
