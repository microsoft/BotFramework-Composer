/// <reference types="Cypress" />
require('cypress-plugin-tab');

// this test is too unstable right now
// re-enable when stablized
context('Cursor move', () => {
  before(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.openBot('ToDoBot');
  });

  beforeEach(() => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.getByText('AddToDo').click();
      cy.wait(100);
    });
  });

  it('can move cursor by pressing direction key', () => {
    cy.withinEditor('VisualEditor', () => {
      cy.get('[data-is-node=true]').as('selectableNodes');
      cy.get('@selectableNodes')
        .eq(0)
        .click();
      cy.wait(100);

      cy.get('@selectableNodes')
        .eq(0)
        .should('have.class', 'step-renderer-container--selected');

      // down arrow
      cy.get('[data-test-id="keyboard-zone"]').type('{downarrow}');
      cy.wait(100);
      cy.get('@selectableNodes')
        .eq(0)
        .should('not.have.class', 'step-renderer-container--selected');

      cy.wait(100);

      // up arrow
      cy.get('[data-test-id="keyboard-zone"]').type('{uparrow}');
      cy.wait(100);
      cy.get('@selectableNodes')
        .eq(0)
        .should('have.class', 'step-renderer-container--selected');
      cy.wait(100);
    });
  });
});
