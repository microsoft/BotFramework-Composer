/// <reference types="Cypress" />

context('onboarding', () => {
  beforeEach(() => {
    cy.visit(`${Cypress.env('COMPOSER_URL')}/home`, { enableOnboarding: true });
    cy.wait(1000);
    cy.get('[data-testid="homePage-ToolBar-New"]').within(() => {
      cy.getByText('New').click();
    });
    cy.wait(5000);

    cy.get('input[data-testid="Create from template"]').click({ force: true });
    cy.wait(100);
    cy.get('[data-testid="TodoSample"]').click();
    cy.wait(100);
    cy.get('button[data-testid="NextStepButton"]').click();
    cy.wait(100);
    cy.get('input[data-testid="NewDialogName"]').type('__TestOnboarding');
    cy.get('input[data-testid="NewDialogName"]').type('{enter}');
    cy.wait(2000);
  });

  it('walk through product tour teaching bubbles', () => {
    cy.getByTestId('onboardingNextSet', { force: true }).click();
    cy.getByTestId('onboardingNext', { force: true }).click();
    cy.getByTestId('onboardingNext', { force: true }).click();
    cy.getByTestId('onboardingNext', { force: true }).click();
    cy.getByTestId('onboardingNext', { force: true }).click();
    cy.getByTestId('onboardingNext', { force: true }).click();

    cy.getByTestId('onboardingNextSet', { force: true }).click();
    cy.getByTestId('onboardingNext', { force: true }).click();

    cy.getByTestId('onboardingNextSet', { force: true }).click();
    cy.getByTestId('onboardingNext', { force: true }).click();

    cy.getByTestId('onboardingNextSet', { force: true }).click();
    cy.getByTestId('onboardingNext', { force: true }).click();

    cy.getByTestId('onboardingDone', { force: true }).click();
  });
});
