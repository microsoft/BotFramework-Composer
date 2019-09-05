/// <reference types="Cypress" />

context('Luis Deploy', () => {
  beforeEach(() => {
    cy.server();
    cy.route('GET', '/api/launcher/connect', 'OK');
    cy.route('POST', '/api/launcher/sync', 'OK');
    cy.route('POST', 'api/projects/opened/settings', 'OK');
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.openBot('ToDoLuisBot');

    // save as a new test bot to prevent changing original luisBot's publish settings and remove it after test
    cy.get('[data-testid="LeftNav-CommandBarButtonHome"]').click();
    cy.getByText('Save as').click();

    cy.get('input[data-testid="NewDialogName"]').type('__TestBot');
    cy.get('input[data-testid="NewDialogName"]').type('{enter}');

    cy.get('[data-testid="ProjectTree"]').within(() => {
      cy.getByText('__TestBot.Main').should('exist');
    });
  });

  it('can deploy luis success', () => {
    cy.get('[data-testid="LeftNav-CommandBarButtonUser Says"]').click();

    cy.route({
      method: 'POST',
      url: '/api/projects/opened/luFiles/publish',
      status: 200,
      response: 'fixture:luPublish/success',
    });
    cy.getByText('Start Bot').click();
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
