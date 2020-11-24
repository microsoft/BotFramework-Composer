// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Publish Page', () => {
  beforeEach(() => {
    cy.server();
    cy.route('POST', '/api/publish/*/publish/*', {
      status: 202,
      message: 'Accepted for publishing.',
      time: new Date(),
      log: '',
      comment: '',
    });
    cy.route('PUT', '/api/projects/*/files/*', 'OK');
    cy.route('GET', '/api/publish/*/status/*', {
      status: 200,
      message: 'Success',
      time: new Date(),
      log: '',
      comment: '',
    });
    cy.route('GET', '/api/publish/types', [
      {
        name: 'azurePublish',
        description: 'azure publish',
        instructions: 'plugin instruction',
        schema: {
          default: {
            test: 'test',
          },
        },
        features: {
          history: true,
          publish: true,
          status: true,
          rollback: true,
        },
      },
    ]);
    cy.route('GET', '/api/publish/*/history/*', []);
    cy.visit('/home');
    cy.createBot('EchoBot');
  });
  it('can publish in publish page', () => {
    // status list exist
    cy.contains('Bot');
    cy.contains('Date');
    cy.findByTestId('Publish').findByTestId('publish-status-list').should('exist');
  });
});
