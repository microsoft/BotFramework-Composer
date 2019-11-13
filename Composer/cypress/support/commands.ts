// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// *********************************************** This example commands.js
// shows you how to create various custom commands and overwrite existing
// commands.
//
// For more comprehensive examples of custom commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command -- Cypress.Commands.add("login", (email,
// password) => { ... })
//
//
// -- This is a child command -- Cypress.Commands.add("drag", { prevSubject:
// 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command -- Cypress.Commands.add("dismiss", { prevSubject:
// 'optional'}, (subject, options) => { ... })
//
//

import 'cypress-testing-library/add-commands';

Cypress.Commands.overwrite('visit', (originalFn, url, { enableOnboarding } = {}) => {
  if (!enableOnboarding) {
    cy.window().then(window =>
      window.localStorage.setItem('composer:OnboardingState', JSON.stringify({ complete: true }))
    );
  }
  originalFn(url);
});

Cypress.Commands.add('createBot', botName => {
  cy.get('[data-testid="LeftNav-CommandBarButtonHome"]').click();
  cy.get('[data-testid="homePage-ToolBar-New"]').within(() => {
    cy.findByText('New').click();
  });
  cy.get('input[data-testid="Create from template"]').click({ force: true });
  cy.get(`[data-testid=${botName}]`).click();
  cy.get('button[data-testid="NextStepButton"]').click();
  cy.get('input[data-testid="NewDialogName"]').type(`__Test${botName}`);
  cy.get('input[data-testid="NewDialogName"]').type('{enter}');
  cy.wait(1000);
});

Cypress.Commands.add('openBot', botName => {
  cy.get('[data-testid="LeftNav-CommandBarButtonHome"]').click();
  cy.get('[data-testid="homePage-ToolBar-Open"]').within(() => {
    cy.findByText('Open').click();
  });
  cy.get('[data-testid="SelectLocation"]').within(() => {
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
  cy.get('[data-testid="ProjectTree"]').within(() => {
    cy.findByText(dialogName).click();
    cy.wait(500);
  });
});

Cypress.Commands.add('startFromTemplate', (template, name) => {
  cy.get('[data-testid="LeftNav-CommandBarButtonHome"]').click();
  cy.findByTestId(`TemplateCopy-${template}`).click();
  cy.get('input[data-testid="NewDialogName"]').type(`__Test${name}`);
  cy.get('input[data-testid="NewDialogName"]').type('{enter}');
  cy.wait(1000);
});

Cypress.Commands.add('copyBot', (bot, name) => {
  cy.createBot(bot);
  cy.get('[data-testid="LeftNav-CommandBarButtonHome"]').click();
  cy.findByText('Save as').click();

  cy.get('input[data-testid="NewDialogName"]').type(`__Test${name}`);
  cy.get('input[data-testid="NewDialogName"]').type('{enter}');
  cy.wait(1000);
});

Cypress.Commands.add('addEventHandler', handler => {
  cy.get('[data-testid="ProjectTree"]').within(() => {
    cy.findByText(/New Trigger ../).click();
  });
  cy.get(`[data-testid="triggerTypeDropDown"]`).click();
  cy.findByText(handler).click();
  if (handler === 'Dialog trigger') {
    cy.get(`[data-testid="eventTypeDropDown"]`).click();
    cy.findByText('consultDialog').click();
  }
  cy.get(`[data-testid="triggerFormSubmit"]`).click();
});
