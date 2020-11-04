// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Creating a new Dialog', () => {
  beforeEach(() => {
    cy.visit('/home');
    cy.createBot('TodoSample');
    cy.findByTestId('LeftNav-CommandBarButtonDesign').click();
  });

  it('can create a new dialog from project tree', () => {
    cy.findByTestId('AddFlyout').click();
    cy.findByTestId('FlyoutNewDialog').click();
    cy.findByTestId('NewDialogName').type('{selectall}TestNewDialog2{enter}');
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('TestNewDialog2').should('exist');
    });
  });
});
