// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('RemoveDialog', () => {
  beforeEach(() => {
    cy.visit('/home');
    cy.createBot('ToDoBotWithLuisSample');
  });

  it('can remove dialog', () => {
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByTestId('$Root_AddItem').within(() => {
        cy.findByTestId('dialogMoreButton').first().invoke('attr', 'style', 'visibility: visible').click();
      });
    });

    cy.findByText('Remove this dialog').click();

    cy.findByText('Yes').click();

    cy.findByTestId('ProjectTree').within(() => {
      cy.get('[title="addItem"]').should('not.exist');
    });
  });
});
