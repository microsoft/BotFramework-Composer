/// <reference types="Cypress" />

context('breadcrumb', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.openBot('ToDoBot');
  });

  it('can show dialog name in breadcrumb', () => {
    cy.get('[data-testid="Breadcrumb"]').within(() => {
      cy.getByText('ToDoBot').should('exist');
    });
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.getByText('AddToDo').click();
    });

    cy.get('[data-testid="Breadcrumb"]').within(() => {
      cy.getByText('AddToDo').should('exist');
    });

    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.getByText('ToDoBot').click();
    });

    cy.withinEditor('VisualEditor', () => {
      cy.getByText('AddIntent').click();
      cy.getByText('AddIntent').click();
    });

    cy.get('[data-testid="Breadcrumb"]').within(() => {
      cy.getByText('ToDoBot').should('exist');
      cy.getByText('AddToDo').should('exist');
    });
  });
});
