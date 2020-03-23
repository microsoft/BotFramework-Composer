// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Luis Deploy', () => {
  beforeEach(() => {
    cy.server();
    cy.route('POST', '/api/publish/*/publish/default', 'OK');
    cy.route('POST', '/api/projects/*/settings', 'OK');
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.createBot('ToDoBotWithLuisSample');
  });

  it('can deploy luis success', () => {
    cy.findByTestId('LeftNav-CommandBarButtonUser Input').click();
    cy.wait(1000);
    cy.route({
      method: 'POST',
      url: 'api/projects/*/luFiles/publish',
      status: 200,
      response: 'fixture:luPublish/success',
    });
    cy.findByText('Start Bot').click();

    // clear its settings before
    cy.findByTestId('ProjectNameInput')
      .clear()
      .type('MyProject');
    cy.findByTestId('EnvironmentInput')
      .clear()
      .type('composer');
    cy.findByTestId('AuthoringKeyInput')
      .clear()
      .type('0d4991873f334685a9686d1b48e0ff48');
    // wait for the debounce interval of sync settings
    cy.findByText('OK').click();
    cy.findByText('Restart Bot').should('exist');
    cy.findByText('Test in Emulator').should('exist');

    cy.route({
      method: 'POST',
      url: 'api/projects/*/luFiles/publish',
      status: 400,
      response: 'fixture:luPublish/error',
    });
    cy.findByText('Restart Bot').click();
    cy.findByText('Try again').click();
    cy.findByTestId('AuthoringKeyInput').type('no-id');
    cy.findByText('OK').click();
  });
});
