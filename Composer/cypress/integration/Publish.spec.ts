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
    // publish page
    cy.contains('Publish Profiles');
    // target list exist
    cy.contains('All profiles');
    cy.findByTestId('Publish').findByTestId('target-list').should('exist');

    // status list exist
    cy.contains('Time');
    cy.contains('Date');
    cy.findByTestId('Publish').findByTestId('publish-status-list').should('exist');

    // add profile
    cy.findByText('Add new profile').click();
    cy.findByText('Add a publish profile').should('exist');
    cy.findByText('Name').type('testProfile');
    cy.findByText('Choose One').click();
    cy.findByText('azure publish').click();
    // show instruction
    cy.findByText('plugin instruction').should('exist');
    // save profile
    cy.findByText('Save').click();
    // new profile should exist in target list
    cy.findByTestId('Publish')
      .findByTestId('target-list')
      .within(() => {
        cy.findByText('testProfile').should('exist');
      });
  });
});
