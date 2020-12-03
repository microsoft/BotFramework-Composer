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
  it('can add profile and publish in publish page', () => {
    // click left nav button
    cy.findByTestId('LeftNav-CommandBarButtonPublish').click();
    cy.findByText('__TestEchoBot');

    cy.contains('Bot');
    cy.contains('Date');
    cy.visitPage('Project Settings');
    cy.findByText('Add new publish profile').click();
    cy.findByText('Add a publish profile').should('exist');
    cy.findAllByPlaceholderText('My Publish Profile').first().type('testProfile');
    cy.findByText('Choose One').click();
    cy.findByText('azure publish').click();
    // save profile
    cy.findByText('Save').click();

    cy.findByTestId('LeftNav-CommandBarButtonPublish').click();
    cy.findByText('testProfile');
  });
});
