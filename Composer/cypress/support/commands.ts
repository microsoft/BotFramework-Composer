// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import '@testing-library/cypress/add-commands';

Cypress.Commands.add('createBot', (bobotId: string, botName?: string) => {
  cy.findByTestId('LeftNav-CommandBarButtonHome').click();
  cy.findByTestId('homePage-ToolBar-New').within(() => {
    cy.findByText('New').click();
  });
  cy.findByTestId('Create from template').click({ force: true });
  cy.findByTestId(`${bobotId}`).click();
  cy.findByTestId('NextStepButton').click();
  cy.findByTestId('NewDialogName').type(`{selectall}__Test${botName || bobotId}{enter}`);
  cy.wait(1000);
});

Cypress.Commands.add('withinEditor', (editorName, cb) => {
  cy.get(`iframe[name="${editorName}"]`).then(editor => {
    cy.wrap<HTMLElement>(editor.contents().find('body') as JQuery<HTMLElement>).within(cb);
  });
});

Cypress.Commands.add('visitPage', page => {
  cy.findByTestId(`LeftNav-CommandBarButton${page}`).click();
});
