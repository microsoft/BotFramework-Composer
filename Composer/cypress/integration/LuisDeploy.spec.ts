// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Luis Deploy', () => {
  beforeEach(() => {
    cy.server();
    cy.route('POST', '/api/publish/*/publish/default', { endpointURL: 'anything', status: 202 });
    cy.route('POST', '/api/projects/*/settings', 'OK');
    cy.route('GET', '/api/publish/*/status/default', { endpointURL: 'anything', status: 404 });
    cy.createTestBot('TestSample', ({ id }) => {
      cy.visit(`/bot/${id}`);
    });
  });

  it('can deploy luis success', () => {
    cy.visitPage('Configure');
    cy.findByText('Development resources').click();
    cy.findAllByTestId('rootLUISAuthoringKey').type('12345678', { delay: 200 });
    cy.findAllByTestId('rootLUISRegion').click();
    cy.findByText('West US').click();
    cy.visitPage('User input');
    cy.visitPage('Create');
    cy.route({
      method: 'POST',
      url: 'api/projects/*/build',
      status: 400,
      response: 'fixture:luPublish/failure',
    });
    cy.findByTestId('startBotButton').click();
    cy.findByTestId('runtime-logs-sidebar');

    cy.route({
      method: 'POST',
      url: 'api/projects/*/build',
      status: 200,
      response: 'fixture:luPublish/success',
    });
    cy.findByTestId('startBotButton').click();
    cy.findByTitle(/^Starting bot../);
  });
});
