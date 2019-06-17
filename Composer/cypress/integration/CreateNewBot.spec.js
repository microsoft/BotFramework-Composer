/// <reference types="Cypress" />

context('Creating a new bot', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
  });

  it('can create a bot from the ToDo template', () => {
    cy.getByText('New').click();
    // cy.pause();
    cy.getByText('ToDoBot').click();
    cy.get('input[data-testid="NewBotProjectInput"]').type('__TestNewProject');
    cy.getByText('Save').click();
    // cy.get('input[data-testid="NewBotProjectInput"]').type('{enter}');
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.getByText('__TestNewProject.main').should('exist');
      cy.getByText('AddToDo').should('exist');
      cy.getByText('ClearToDos').should('exist');
      cy.getByText('DeleteToDo').should('exist');
      cy.getByText('ShowToDos').should('exist');
    });
  });
});
