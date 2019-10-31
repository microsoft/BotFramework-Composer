/// <reference types="Cypress" />

context('onboarding', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'), { enableOnboarding: true });
    cy.wait(100);
  });

  it('can walk through steps', () => {
    cy.getByTestId('onboardingNext', { force: true }).click();

    cy.getByTestId('toDoBotWithLuisSample').click();
    cy.getByTestId('NewDialogName').type('__OnboardingTest{enter}');
    cy.wait(2000);

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
