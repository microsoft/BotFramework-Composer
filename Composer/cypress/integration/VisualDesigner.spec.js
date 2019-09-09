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
      cy.contains('Microsoft.OnEvent').should('exist');
    });

    cy.addIntentHandler('Handle an Intent');
    cy.wait(100);

    cy.withinEditor('VisualEditor', () => {
      cy.contains('Microsoft.OnIntent').should('exist');
    });

    cy.addIntentHandler('Handle Unknown Intent');
    cy.wait(100);

    cy.withinEditor('VisualEditor', () => {
      cy.contains('Microsoft.OnUnknownIntent').should('exist');
    });

    cy.addConversationHandler('Handle ConversationUpdate');
    cy.wait(100);

    cy.withinEditor('VisualEditor', () => {
      cy.contains('Microsoft.OnConversationUpdateActivity').should('exist');
    });
  });
});
