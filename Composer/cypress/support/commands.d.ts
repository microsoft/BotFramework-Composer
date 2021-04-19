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
     * Creates a bot based on empty bot.
     * @example cy.createBot('EmptySample', ()=> {})
     */
    createBotV2(botName: string, createdCallback: (bot: any) => void): void;

    /**
     * Creates a bot based on empty bot.
     * @example cy.createTemplateBot('EmptySample', ()=> {})
     */
    createTemplateBot(botName: string, createdCallback: (bot: any) => void): void;

    /**
     * Creates a bot from above created template bot.
     * @example cy.createTestBot('EmptySample', ()=> {})
     */
    createTestBot(botName: string, createdCallback: (bot: any) => void): void;

    /**
     * Visits a page from the left nav bar using the page's testid
     * @example visitPage('Bot Responses');
     */
    visitPage(page: string): void;

    /**
     * Invokes callback inside editor context
     * @example cy.withinEditor('VisualEditor', () => {
     *    cy.findByText('SomeText');
     * });
     */
    withinEditor(editor: string, cb: (currentSubject: JQuery<HTMLElement>) => void): void;

    /**
     * Clears a text box, adds text to it and submit.
     * @example cy.withinEditor('VisualEditor', () => {
     *    cy.enterTextAndSubmit;('NewDialogName', 'SubmitNewBotBtn', 'New Project');
     * });
     */
    enterTextAndSubmit(textElement: string, text: string, submitBtn?: string): void;
  }
}
