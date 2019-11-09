/// <reference types="Cypress" />

context('RemoveDialog', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.copyBot('ToDoBotWithLuisSample', 'ToDoBotWithLuisSampleSpec');
  });

  it('can remove dialog', () => {
    cy.getByTestId('ProjectTree').within(() => {
      cy.getByTestId('DialogTreeItemtriggers[4]').within(() => {
        cy.getByTestId('dialogMoreButton')
          .first()
          .invoke('attr', 'style', 'visibility: visible')
          .click();
        });
      });

    cy.get('.ms-ContextualMenu-linkContent > .ms-ContextualMenu-itemText').within(() => {
      cy.getByText('Delete').click();
    });

    cy.getByTestId('ProjectTree').within(() => {
      cy.get('[title="AddItem"]').should('not.exist');
    });
  });
});
