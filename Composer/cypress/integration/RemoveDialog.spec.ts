// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('RemoveDialog', () => {
  beforeEach(() => {
    cy.visit('/home');
    cy.createBot('ToDoBotWithLuisSample');
  });

  it('can remove dialog', () => {
    cy.findByTestId('ProjectTree').within(() => {
      cy.findAllByText('__TestToDoBotWithLuisSample').first().click();
      cy.findByTestId('DialogTreeItemtriggers[4]').within(() => {
        cy.findByTestId('dialogMoreButton').first().invoke('attr', 'style', 'visibility: visible').click();
      });
    });

    cy.get('.ms-ContextualMenu-linkContent > .ms-ContextualMenu-itemText').within(() => {
      cy.findByText('Delete').click();
    });

    cy.findByTestId('ProjectTree').within(() => {
      cy.get('[title="AddItem"]').should('not.exist');
    });
  });
});
