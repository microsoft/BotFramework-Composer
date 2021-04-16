// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('LG Page', () => {
  beforeEach(() => {
    cy.createBotV2('EmptySample', ({ id }) => {
      cy.visit(`/bot/${id}`);
    });
  });

  it('can open language generation page', () => {
    cy.findByTestId('LeftNav-CommandBarButtonBot responses').click();
    // left nav tree
    cy.contains('__TestEmptySample');

    cy.findByTestId('showcode').as('switchButton');

    // by default is table view
    cy.findByTestId('LGPage').findByTestId('table-view').should('exist');
    // goto edit-mode
    cy.get('@switchButton').click();
    cy.findByTestId('LGPage').get('.monaco-editor').should('exist');

    // back to table view
    cy.get('@switchButton').click();

    // click the logo to clear any stray navigation
    cy.findByAltText('Composer Logo').click();

    // nav to Main dialog
    cy.findByTestId('ProjectTree').within(() => {
      cy.findAllByText('__TestEmptySample').last().click();
    });
  });
});
