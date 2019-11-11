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

Cypress.Commands.overwrite("visit", (originalFn, url, { enableOnboarding } = {}) => {
  if (!enableOnboarding) {
    cy.window().then(window => window.localStorage.setItem('composer:OnboardingState', JSON.stringify({ complete: true })));
  }
  originalFn(url);
 });

import 'cypress-testing-library/add-commands';

Cypress.Commands.add('createBot', botName => {
  cy.get('[data-testid="LeftNav-CommandBarButtonHome"]').click();
  cy.wait(500);
  cy.get('[data-testid="homePage-ToolBar-New"]').within(() => {
    cy.getByText('New').click();
  });
  cy.wait(500);
  cy.get('input[data-testid="Create from template"]').click({ force: true });
  cy.wait(100);
  cy.get(`[data-testid=${botName}]`).click();
  cy.wait(100);
  cy.get('button[data-testid="NextStepButton"]').click();
  cy.wait(100);
  cy.get('input[data-testid="NewDialogName"]').type(`__Test${botName}`);
  cy.get('input[data-testid="NewDialogName"]').type('{enter}');
});

Cypress.Commands.add('openBot', botName => {
  cy.get('[data-testid="LeftNav-CommandBarButtonHome"]').click();
  cy.get('[data-testid="homePage-ToolBar-Open"]').within(() => {
    cy.getByText('Open').click();
  });
  cy.get('[data-testid="SelectLocation"]').within(() => {
    cy.get(`[aria-label="${botName}"]`).click({ force: true });
    cy.wait(500);
  });
  cy.wait(500);
});

Cypress.Commands.add('withinEditor', (editorName, cb) => {
  cy.get(`iframe[name="${editorName}"]`).then(editor => {
    cy.wrap(editor.contents().find('body')).within(cb);
  });
});

Cypress.Commands.add('openDialog', dialogName => {
  cy.get('[data-testid="ProjectTree"]').within(() => {
    cy.getByText(dialogName).click();
    cy.wait(500);
  });
});

Cypress.Commands.add('startFromTemplate', (template, name) => {
  cy.get('[data-testid="LeftNav-CommandBarButtonHome"]').click();
  cy.getByTestId(`TemplateCopy-${template}`).click();
  cy.get('input[data-testid="NewDialogName"]').type(`__Test${name}`);
  cy.get('input[data-testid="NewDialogName"]').type('{enter}');
  cy.wait(1000);
});

Cypress.Commands.add('copyBot', (bot, name) => {
  cy.createBot(bot);
  cy.get('[data-testid="LeftNav-CommandBarButtonHome"]').click();
  cy.getByText('Save as').click();

  cy.get('input[data-testid="NewDialogName"]').type(`__Test${name}`);
  cy.get('input[data-testid="NewDialogName"]').type('{enter}');
  cy.wait(1000);
});

Cypress.Commands.add('addEventHandler', handler => {
  cy.get('[data-testid="ProjectTree"]').within(() => {
    cy.getByText(/New Trigger ../).click();
  });
  cy.get(`[data-testid="triggerTypeDropDown"]`).click();
  cy.getByText(handler).click();
  if (handler === 'Dialog trigger') {
    cy.get(`[data-testid="eventTypeDropDown"]`).click();
    cy.getByText('consultDialog').click();
  }
  cy.get(`[data-testid="triggerFormSubmit"]`).click();
});
