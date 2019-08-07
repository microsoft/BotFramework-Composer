/// <reference types="Cypress" />

context('Luis Deploy', () => {
  beforeEach(() => {
    cy.server();
    cy.route('GET', '/api/launcher/connect', 'OK');
    cy.route('POST', '/api/launcher/sync', 'OK');

    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.openBot('ToDoLuisBot');
  });

  it('can deploy luis success', () => {
    cy.get('[data-testid="LeftNav-CommandBarButtonUser Says"]').click();
    cy.get('[data-testid="LUEditor"]').within(() => {
      cy.getAllByText('ToDoLuisBot').should('exist');
    });

    cy.route('POST', '/api/projects/opened/luFiles/publish', 'fixture:luPublish/success').as('publish');

    cy.getByText('Start Bot').click();
    cy.get('[data-testid="ProjectNameInput"]').type('MyProject');
    cy.get('[data-testid="EnvironmentInput"]').type('composer');
    cy.get('[data-testid="AuthoringKeyInput"]').type('0d4991873f334685a9686d1b48e0ff48');
    cy.getByText('Publish').click();
    cy.getByText('Restart Bot').should('exist');
    cy.getByText('Test in Emulator').should('exist');

    cy.route({
      method: 'POST',
      url: '/api/projects/opened/luFiles/publish',
      status: 400,
      response: 'fixture:luPublish/error',
    });
    cy.getByText('Restart Bot').click();
    cy.getByText('Try again').click();
    cy.get('[data-testid="AuthoringKeyInput"]').type('no-id');
    cy.getByText('Publish').click();
  });
});
