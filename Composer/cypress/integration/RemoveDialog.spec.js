/// <reference types="Cypress" />

context('RemoveDialog', () => {
  before(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.copyBot('ToDoLuisBot', 'ToDoLuisBotSpec');
  });

  it('can remove dialog', () => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.get('[data-testid="DialogTreeItemAddItem"]')
        .click()
        .trigger('mousedown');
      cy.get('[data-testid="dialogMoreButton"]')
        .first()
        .invoke('attr', 'style', 'visibility: visible')
        .click();
    });
    cy.get('.ms-ContextualMenu-linkContent > .ms-ContextualMenu-itemText').within(() => {
      cy.getByText('Delete').click();
    });
    cy.getByText('Yes').click();
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.get('[title="AddItem"]').should('not.exist');
    });
  });
});
