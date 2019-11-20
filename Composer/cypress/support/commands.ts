// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import '@testing-library/cypress/add-commands';

Cypress.Commands.overwrite('visit', (originalFn, url, { enableOnboarding } = {}) => {
  if (!enableOnboarding) {
    cy.window().then(window =>
      window.localStorage.setItem('composer:OnboardingState', JSON.stringify({ complete: true }))
    );
  }
  originalFn(url);
});

Cypress.Commands.add('createBot', botName => {
  cy.findByTestId('LeftNav-CommandBarButtonHome').click();
  cy.findByTestId('homePage-ToolBar-New').within(() => {
    cy.findByText('New').click();
  });
  cy.findByTestId('Create from template').click({ force: true });
  cy.findByTestId(`${botName}`).click();
  cy.findByTestId('NextStepButton').click();
  cy.findByTestId('NewDialogName').type(`{selectall}__Test${botName}{enter}`);
  cy.wait(1000);
});

Cypress.Commands.add('openBot', botName => {
  cy.findByTestId('LeftNav-CommandBarButtonHome').click();
  cy.findByTestId('homePage-ToolBar-Open').within(() => {
    cy.findByText('Open').click();
  });
  cy.findByTestId('SelectLocation').within(() => {
    cy.get(`[aria-label="${botName}"]`).click({ force: true });
    cy.wait(500);
  });
  cy.wait(500);
});

Cypress.Commands.add('withinEditor', (editorName, cb) => {
  cy.get(`iframe[name="${editorName}"]`).then(editor => {
    cy.wrap<HTMLElement>(editor.contents().find('body') as JQuery<HTMLElement>).within(cb);
  });
});

Cypress.Commands.add('openDialog', dialogName => {
  cy.findByTestId('ProjectTree').within(() => {
    cy.findByText(dialogName).click();
    cy.wait(500);
  });
});

Cypress.Commands.add('startFromTemplate', (template, name) => {
  cy.findByTestId('LeftNav-CommandBarButtonHome').click();
  cy.findByTestId(`TemplateCopy-${template}`).click();
  cy.findByTestId('NewDialogName').type(`__Test${name}`);
  cy.findByTestId('NewDialogName').type('{enter}');
  cy.wait(1000);
});

Cypress.Commands.add('copyBot', (bot, name) => {
  cy.createBot(bot);
  cy.findByTestId('LeftNav-CommandBarButtonHome').click();
  cy.findByText('Save as').click();

  cy.findByTestId('NewDialogName').type(`__Test${name}`);
  cy.findByTestId('NewDialogName').type('{enter}');
  cy.wait(1000);
});

Cypress.Commands.add('addEventHandler', handler => {
  cy.findByTestId('ProjectTree').within(() => {
    cy.findByText(/New Trigger ../).click();
  });
  cy.findByTestId('triggerTypeDropDown').click();
  cy.findByText(handler).click();
  if (handler === 'Dialog trigger') {
    cy.findByTestId('eventTypeDropDown').click();
    cy.findByText('consultDialog').click();
  }
  cy.findByTestId('triggerFormSubmit').click();
});

Cypress.Commands.add('visitPage', page => {
  cy.findByTestId(`LeftNav-CommandBarButton${page}`).click();
});
