// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import '@testing-library/cypress/add-commands';

let TemplateBotProjectId = '';

Cypress.Commands.add('createBot', (botName: string, callback: (bot: any) => void) => {
  const params = {
    description: '',
    location: '',
    name: botName,
    runtimeLanguage: 'dotnet',
    runtimeType: 'webapp',
    schemaUrl: '',
    storageId: 'default',
    templateId: '@microsoft/generator-bot-empty',
    templateVersion: '1.0.0-rc3',
  };

  const pollingRequestBotStatus = (jobId: string, callback: (result: any) => void) => {
    cy.wait(2000);
    try {
      cy.request('get', `/api/status/${jobId}`).then((res) => {
        const { httpStatusCode, id, result } = res.body;
        if (httpStatusCode !== 200) {
          pollingRequestBotStatus(id, callback);
        } else {
          callback(result);
        }
      });
    } catch (error) {
      pollingRequestBotStatus(jobId, callback);
    }
  };

  cy.request('post', '/api/v2/projects', params).then((res) => {
    const { jobId } = res.body;
    // install package can take a long time.
    cy.wait(20000);
    pollingRequestBotStatus(jobId, (result) => callback(result));
  });
});

Cypress.Commands.add('createTemplateBot', (botName: string, callback: (bot: any) => void) => {
  cy.createBot(`TemplateBot_${botName}`, (bot) => {
    TemplateBotProjectId = bot.id;
  });
});

Cypress.Commands.add('createTestBot', (botName: string, callback: (bot: any) => void) => {
  const name = `TestBot_${botName}`;

  const params = {
    description: '',
    location: '',
    name,
    storageId: 'default',
  };

  cy.request('post', `/api/projects/${TemplateBotProjectId}/project/saveAs`, params).then((res) => {
    callback(res.body);
  });
});

Cypress.Commands.add('withinEditor', (editorName, cb) => {
  cy.findByTestId(editorName).within(cb);
});

Cypress.Commands.add('visitPage', (page: string, checked = true) => {
  cy.findByTestId(`LeftNav-CommandBarButton${page}`).click();
  if (checked) cy.findByTestId('ActiveLeftNavItem').should('contain', page);

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
