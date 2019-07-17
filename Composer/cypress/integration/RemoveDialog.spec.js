/// <reference types="Cypress" />

context('RemoveDialog', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.copyBot('ToDoLuisBot', 'ToDoLuisBotSpec');
  });

  it('can remove dialog', () => {
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.get('[data-testid="DialogTreeItemAddItem"]').trigger('mousedown');
      cy.get('[data-testid="dialogMoreButton"]')
        .first()
        .invoke('attr', 'style', 'visibility: visible')
        .click();
    });
    cy.getByText('Delete').click();
    cy.getByText('Okay').click();
    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.get('[title="AddItem"]').should('not.exist');
    });
  });
});
