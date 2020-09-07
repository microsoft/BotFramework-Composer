// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Luis Deploy', () => {
  beforeEach(() => {
    cy.server();
    cy.route('POST', '/api/publish/*/publish/default', { endpointURL: 'anything', status: 202 });
    cy.route('POST', '/api/projects/*/settings', 'OK');
    cy.route('GET', '/api/publish/*/status/default', { endpointURL: 'anything', status: 200 });
    cy.visit('/home');
    cy.createBot('ToDoBotWithLuisSample');
  });

  it('can deploy luis success', () => {
    cy.findByTestId('LeftNav-CommandBarButtonUser Input').click();
    cy.url().should('contain', 'language-understanding/all');
    cy.route({
      method: 'POST',
      url: 'api/projects/*/build',
      status: 200,
      response: 'fixture:luPublish/success',
    });
    cy.findByText('Start Bot').click();

    // clear its settings before
    cy.enterTextAndSubmit('ProjectNameInput', 'MyProject');
    cy.enterTextAndSubmit('EnvironmentInput', 'composer');
    cy.enterTextAndSubmit('AuthoringKeyInput', '0d4991873f334685a9686d1b48e0ff48');
    // wait for the debounce interval of sync settings
    cy.findByText('OK').click();
    cy.findByText('Restart Bot').should('exist');
    cy.findByText('Test in Emulator').should('exist');

    cy.route({
      method: 'POST',
      url: 'api/projects/*/build',
      status: 400,
      response: 'fixture:luPublish/error',
    });
    cy.findByText('Restart Bot').click();
    cy.findByText('Try again').click();
    cy.findByTestId('AuthoringKeyInput').type('no-id');
    cy.findByText('OK').click();
  });
});
