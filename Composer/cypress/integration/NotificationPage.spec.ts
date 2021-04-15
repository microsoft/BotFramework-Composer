// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Notification Page', () => {
  beforeEach(() => {
    cy.createBot('ToDoBotWithLuisSample');
  });

  it('can show lg syntax error ', () => {
    cy.visitPage('Design');
    cy.visitPage('Bot responses');

    cy.findByTestId('ProjectTree').within(() => {
      cy.findAllByText('__TestToDoBotWithLuisSample').last().click();
    });

    cy.findByTestId('showcode').click();
    cy.get('textarea').type('#', { delay: 200 });

    cy.findByTestId('LeftNav-CommandBarButtonDiagnostics').click();

    cy.findByTestId('diagnostics-table-view').within(() => {
      cy.findAllByText('__TestToDoBotWithLuisSample.en-us.lg').should('exist').first().click();
    });

    cy.findAllByText('Bot responses').should('exist');
  });

  it('can show lu syntax error ', () => {
    cy.visitPage('Design');
    cy.visitPage('User input');

    cy.findByTestId('ProjectTree').within(() => {
      cy.findAllByText('__TestToDoBotWithLuisSample').last().click();
    });

    cy.findByTestId('showcode').click();
    cy.get('textarea').type('t*', { delay: 200 });

    cy.findByTestId('LeftNav-CommandBarButtonDiagnostics').click();

    cy.findByTestId('diagnostics-table-view').within(() => {
      cy.findAllByText('__TestToDoBotWithLuisSample.en-us.lu').should('exist').first().dblclick();
    });

    cy.findAllByText('__TestToDoBotWithLuisSample').should('exist');
  });

  // it('can show dialog expression error ', () => {
  //   cy.visitPage('Design');

  //   cy.findByTestId('ProjectTree').within(() => {
  //     cy.findByText('WelcomeUser').click();
  //   });

  //   cy.withinEditor('VisualEditor', () => {
  //     cy.findByText('WelcomeUser').should('exist');
  //   });

  //   cy.withinEditor('PropertyEditor', () => {
  //     cy.findByText('Condition').should('exist');
  //     cy.findByTestId('expression-type-dropdown-Condition').focus().should('contain.text', 'expression');
  //     cy.get('#root\\.condition').click().type('=foo = bar', { delay: 200 });
  //     cy.findByTestId('FieldErrorMessage').should('exist');
  //   });

  //   cy.findByTestId('notifications-info-button').click();

  //   // move away from the Notifications button (clicking the logo should do nothing)
  //   cy.findByAltText('Composer Logo').click();

  //   cy.findByTestId('notifications-table-view').within(() => {
  //     cy.findAllByText('__testtodobotwithluissample.dialog').should('exist').first().dblclick();
  //   });

  //   cy.findAllByText('WelcomeUser').should('exist');
  // });
});
