/// <reference types="Cypress" />

context('Luis Deploy', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.openBot('ToDoLuisBot');
  });

  it('can deploy luis success', () => {
    cy.visit(Cypress.env('COMPOSER_URL') + '/language-understanding/ToDoLuisBot.main');
    cy.get('[data-testid="LUEditor"]').within(() => {
      cy.getByText('ToDoLuisBot.main.lu').should('exist');
    });

    cy.getByText('Publish to Luis').click();
    cy.get('[data-testid="ProjectNameInput"]').type('MyProject');
    cy.get('[data-testid="EnvironmentInput"]').type('composer');
    cy.get('[data-testid="AuthoringKeyInput"]').type('0d4991873f334685a9686d1b48e0ff48');
    cy.server()
      .route('POST', /api/)
      .as('publish');
    cy.getByText('Publish').click();
    cy.wait('@publish', { timeout: 300000 })
      .its('status')
      .should('be', 200);
    cy.getByText('Return').should('exist');

    cy.getByText('Return').click();
    cy.getByText('Publish to Luis').click();
    cy.get('[data-testid="AuthoringKeyInput"]').type('no-id');
    cy.getByText('Publish').click();
    cy.wait(500);
    cy.getByText('Try again').should('exist');
  });
});
