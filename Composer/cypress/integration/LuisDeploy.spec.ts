// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Luis Deploy', () => {
  beforeEach(() => {
    cy.server();
    cy.route('POST', '/api/publish/*/publish/default', { endpointURL: 'anything', status: 202 });
    cy.route('POST', '/api/projects/*/settings', 'OK');
    cy.route('GET', '/api/publish/*/status/default', { endpointURL: 'anything', status: 404 });
    cy.visit('/home');
    cy.createBot('ToDoBotWithLuisSample');
  });

  it('can deploy luis success', () => {
    cy.findByTestId('LeftNav-CommandBarButtonUser Input').click();
    cy.url().should('contain', 'language-understanding/all');
    cy.findByTestId('LeftNav-CommandBarButtonDesign').click();
    cy.route({
      method: 'POST',
      url: 'api/projects/*/build',
      status: 400,
      response: 'fixture:luPublish/failure',
    });
    cy.findByText(/^Start all bots/).click();
    cy.findByTitle('Open start bots panel').click();
    cy.findByText('See Details').click();

    cy.route({
      method: 'POST',
      url: 'api/projects/*/build',
      status: 200,
      response: 'fixture:luPublish/success',
    });
    cy.findByText('Try again').click();
    cy.findByText(/^Stop all bots/).click();
  });
});
