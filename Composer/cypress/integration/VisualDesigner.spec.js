/// <reference types="Cypress" />

context('Visual Designer', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.startFromTemplate('EmptyBot', 'VisualDesignerTest');
  });

  //will remove skip after add trigger is ok
  it('can add a rule from the visual designer', () => {
    cy.addEventHandler('Handle an Event');
    cy.wait(100);

    cy.withinEditor('VisualEditor', () => {
      cy.contains('Microsoft.EventRule').should('exist');
    });

    cy.addEventHandler('Handle an Intent');
    cy.wait(100);

    cy.withinEditor('VisualEditor', () => {
      cy.contains('Microsoft.IntentRule').should('exist');
    });

    cy.addEventHandler('Handle Unknown Intent');
    cy.wait(100);

    cy.withinEditor('VisualEditor', () => {
      cy.contains('Microsoft.UnknownIntentRule').should('exist');
    });

    cy.addEventHandler('Handle ConversationUpdate');
    cy.wait(100);

    cy.withinEditor('VisualEditor', () => {
      cy.contains('Microsoft.ConversationUpdateActivityRule').should('exist');
    });
  });
});
