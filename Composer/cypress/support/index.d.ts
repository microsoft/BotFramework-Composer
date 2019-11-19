// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

declare namespace Cypress {
  interface Chainable<Subject = any> {
    /**
     * Creates a bot based on template id
     * @example cy.createBot('TodoSample')
     */
    createBot(botName: string): void;
    /**
     * Invokes callback inside editor context
     * @example cy.withinEditor('VisualEditor', () => {
     *    cy.findByText('SomeText');
     * });
     */
    withinEditor(editor: string, cb: (currentSubject: JQuery<HTMLElement>) => void): void;
  }
}
