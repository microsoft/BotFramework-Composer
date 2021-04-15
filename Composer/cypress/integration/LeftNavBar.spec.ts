// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Left Nav Bar', () => {
  beforeEach(() => {
    cy.visit('/home');
    cy.createBot('TodoSample');
  });

  it('can expand left Nav Bar', () => {
    cy.findByTestId('LeftNavButton').click();
    cy.findByTestId('LeftNav-CommandBarButtonDesign').should('exist');
    cy.findByTestId('LeftNav-CommandBarButtonBot responses').click();
    cy.url().should('include', 'language-generation');
    cy.findByTestId('LeftNav-CommandBarButtonUser input').click();
    cy.url().should('include', 'language-understanding');
    cy.findByTestId('LeftNav-CommandBarButtonComposer settings').click();
    cy.url().should('include', 'setting');
  });
});
