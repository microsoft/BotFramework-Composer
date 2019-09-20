/// <reference types="Cypress" />
require('cypress-plugin-tab');

// this test is too unstable right now
// re-enable when stablized
context('Cursor move', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.openBot('ToDoBot');
  });
  it('can move cursor by pressing direction key or tab', () => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.getByText('AddToDo').click();
      cy.wait(100);
    });

    cy.withinEditor('VisualEditor', () => {
      cy.get('[data-is-node=true]').as('selectedNodes');
      cy.get('@selectedNodes')
        .eq(1)
        .click();

      // down arrow
      cy.get('[data-test-id="keyboard-zone"]').type('{downarrow}');
      cy.wait(100);
      cy.get('@selectedNodes')
        .eq(2)
        .should('have.class', 'step-renderer-container--selected');

      cy.wait(100);

      // right arrow
      cy.get('[data-test-id="keyboard-zone"]').type('{rightarrow}');
      cy.wait(100);
      cy.get('@selectedNodes')
        .eq(4)
        .should('have.class', 'step-renderer-container--selected');

      cy.wait(100);

      // left arrow
      cy.get('[data-test-id="keyboard-zone"]').type('{leftarrow}');
      cy.wait(100);
      cy.get('@selectedNodes')
        .eq(5)
        .should('have.class', 'step-renderer-container--selected');

      cy.wait(100);

      // up arrow
      cy.get('[data-test-id="keyboard-zone"]').type('{uparrow}');
      cy.wait(100);
      cy.get('@selectedNodes')
        .eq(3)
        .should('have.class', 'step-renderer-container--selected');
      cy.wait(100);

      cy.get('[data-is-selectable=true]').as('selectedElements');

      cy.get('@selectedElements')
        .eq(1)
        .click();

      // tab
      cy.get('[data-test-id="keyboard-zone"]').tab();
      cy.wait(100);
      cy.get('@selectedElements')
        .eq(2)
        .should('have.class', 'step-renderer-container--selected');
      cy.wait(100);
    });
  });
});
