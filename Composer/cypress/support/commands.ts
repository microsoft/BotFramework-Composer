// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import '@testing-library/cypress/add-commands';

Cypress.Commands.add('createBot', (botId: string, botName?: string) => {
  const name = `__Test${botName || botId}`;

  const params = {
    storageId: 'default',
    name,
    description: '',
    templateId: botId,
  };

  cy.request('post', '/api/projects', params).then((res) => {
    const { id: projectId } = res.body;
    cy.visit(`/bot/${projectId}/dialogs/${name.toLowerCase()}`);
  });
});

Cypress.Commands.add('withinEditor', (editorName, cb) => {
  cy.findByTestId(editorName).within(cb);
});

Cypress.Commands.add('visitPage', (page) => {
  cy.findByTestId(`LeftNav-CommandBarButton${page}`).click();
  cy.findByTestId('ActiveLeftNavItem').should('contain', page);

  // click the logo to clear any stray tooltips from page navigation
  cy.findByAltText('Composer Logo').click({ force: true });
});

Cypress.Commands.add('enterTextAndSubmit', (textElement: string, text: string, submitBtn?: string) => {
  cy.findByTestId(textElement).clear().type(text);
  if (submitBtn) {
    cy.findByTestId(submitBtn).click();
  }
});

Cypress.on('uncaught:exception', (err) => {
  // eslint-disable-next-line no-console
  console.log('uncaught exception', err);
  return false;
});
