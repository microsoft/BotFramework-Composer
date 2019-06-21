/// <reference types="Cypress" />

context('Visual Designer', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.copyBot('ToDoLuisBot', 'VisualDesignerTest');
  });

  it('can add a step from the visual designer', () => {
    cy.withinEditor('VisualEditor', () => {
      let btns = cy.get('button[aria-label="Add"]');
      btns.first().click();

      cy.getByText('Ask a Question').click();
      cy.getByText('Type: Text').click();

      cy.get('.node-renderer-container--focused').within(() => {
        cy.getByText('TextInput').should('exist');
      });

      btns = cy.get('button[aria-label="Add"]');
      btns.last().click();

      cy.getByText('Flow').click();
      cy.getByText('End this turn').click();

      cy.get('.node-renderer-container--focused').within(() => {
        cy.getByText('EndTurn').should('exist');
      });
    });
  });
});
