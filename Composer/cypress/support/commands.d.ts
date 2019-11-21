// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Creates a bot based on template id.
     * If botName not provided, names the bot __Test${botId},
     * otherwise, __Test&{botName}.
     * @example cy.createBot('TodoSample', 'NewBotName')
     */
    createBot(botId: string, botName?: string): void;

    /**
     * Invokes callback inside editor context
     * @example cy.withinEditor('VisualEditor', () => {
     *    cy.findByText('SomeText');
     * });
     */
    withinEditor(editor: string, cb: (currentSubject: JQuery<HTMLElement>) => void): void;
  }
}
