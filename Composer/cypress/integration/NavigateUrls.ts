// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Navigate Url', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
  });

  it('should open Create From Scratch/Template window from a url', () => {
    cy.visit(`${Cypress.env('COMPOSER_URL')}/projects/create`);
    cy.get('[data-testid="Create from scratch"]').should('be.visible');
    cy.get('[data-testid="Create from template"]').should('be.visible');
  });

  it('should open Define Conversations window from a url', () => {
    cy.visit(`${Cypress.env('COMPOSER_URL')}/projects/create/TodoSample`);
    cy.get('[data-testid="NewDialogName"]').should('be.visible');
  });

  it('should create the Open a Bot window from a location through the specified url', () => {
    cy.visit(`${Cypress.env('COMPOSER_URL')}/projects/open`);
    cy.get('[data-testid="SelectLocation"]').should('be.visible');
  });
});
