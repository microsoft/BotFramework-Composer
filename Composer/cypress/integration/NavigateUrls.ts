// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Navigate Url', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
  });

  it.only('should open create from scratch/template window from a url', () => {
    cy.visit(`${Cypress.env('COMPOSER_URL')}/home/createProject`);
    cy.get('[data-testid="Create from scratch"]').should('be.visible');
    cy.get('[data-testid="Create from template"]').should('be.visible');
  });

  it.only('should open window to define conversation from a url', () => {
    cy.visit(`${Cypress.env('COMPOSER_URL')}/home/create/template/TodoSample`);
    cy.get('[data-testid="NewDialogName"]').should('be.visible');
  });

  it.only('should create the Open a Bot window from a location through the specified url', () => {
    cy.visit(`${Cypress.env('COMPOSER_URL')}/home/openProject`);
    cy.get('[data-testid="SelectLocation"]').should('be.visible');
  });
});
