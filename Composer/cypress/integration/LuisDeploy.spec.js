/// <reference types="Cypress" />

context('Luis Deploy', () => {
  beforeEach(() => {
    cy.server();
    cy.route('GET', '/api/launcher/connect?botEnvironment=production', 'OK');
    cy.route('POST', '/api/launcher/sync', 'OK');
    cy.route('POST', 'api/projects/opened/settings', 'OK');
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.createBot('ToDoBotWithLuisSample');
  });

  it('can deploy luis success', () => {
    cy.get('[data-testid="LeftNav-CommandBarButtonUser Input"]').click();

    cy.route({
      method: 'POST',
      url: '/api/projects/opened/luFiles/publish',
      status: 200,
      response: 'fixture:luPublish/success',
    });
    cy.getByText('Start Bot').click();
    cy.wait(5000);
    // clear its settings before
    cy.get('[data-testid="ProjectNameInput"]')
      .clear()
      .type('MyProject');
    cy.get('[data-testid="EnvironmentInput"]')
      .clear()
      .type('composer');
    cy.get('[data-testid="AuthoringKeyInput"]')
      .clear()
      .type('0d4991873f334685a9686d1b48e0ff48');
    // wait for the debounce interval of sync settings
    cy.wait(1000);
    cy.getByText('OK').click();
    cy.wait(1000);
    cy.getByText('Restart Bot').should('exist');
    cy.getByText('Test in Emulator').should('exist');

    cy.route({
      method: 'POST',
      url: '/api/projects/opened/luFiles/publish',
      status: 400,
      response: 'fixture:luPublish/error',
    });
    cy.getByText('Restart Bot').click();
    cy.wait(1000);
    cy.getByText('Try again').click();
    cy.wait(1000);
    cy.get('[data-testid="AuthoringKeyInput"]').type('no-id');
    cy.getByText('OK').click();
  });
});
