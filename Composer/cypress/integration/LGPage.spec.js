/// <reference types="Cypress" />

context('check language generation page', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.openBot('ToDoBot');
  });

  it('can open language generation page', () => {
    cy.visit(Cypress.env('COMPOSER_URL') + '/language-generation/common');

    cy.contains('common.lg');
    cy.contains('todo.lg');

    // form-mode
    cy.get('[data-testid="LGEditor"]').within(() => {
      cy.getByText('New template').should('exist');
    });

    // text-mode
    cy.get('button[role="switch"]').click();
    cy.get('[data-testid="LGEditor"]').within(() => {
      cy.getByText('# Hello').should('exist');
    });

    // nav to todo.lg
    cy.getByText('todo.lg').click();
    cy.get('[data-testid="LGEditor"]').within(() => {
      cy.getByText('# ShowTodo').should('exist');
    });
  });
});
