/// <reference types="Cypress" />

context('Visual Designer', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.startFromTemplate('EmptyBot', 'VisualDesignerTest');
  });

  function clickAddEvent(event) {
    cy.getByTestId('EventsEditorAdd').click();
    cy.getByText(event).click();
  }

  it('can add a rule from the visual designer', () => {
    cy.withinEditor('VisualEditor', () => {
      clickAddEvent('Handle an Event');
      cy.wait(100);
      cy.get('.event-renderer-container--focused').within(() => {
        cy.contains('Handle an Event').should('exist');
      });

      clickAddEvent('Handle an Intent');
      cy.wait(100);
      cy.get('.event-renderer-container--focused').within(() => {
        cy.contains('Handle an Intent').should('exist');
      });

      clickAddEvent('Handle Unknown Intent');
      cy.wait(100);
      cy.get('.event-renderer-container--focused').within(() => {
        cy.contains('Handle Unknown Intent').should('exist');
      });

      clickAddEvent('Handle ConversationUpdate');
      cy.wait(100);
      cy.get('.event-renderer-container--focused').within(() => {
        cy.contains('Handle ConversationUpdate').should('exist');
      });
    });
  });
});
