/// <reference types="Cypress" />

context('onboarding', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'), { enableOnboarding: true });
    cy.wait(100);
  });

  it('can walk through steps', () => {
    const { complete: beginningOnboardingState } = JSON.parse(localStorage.getItem('OnboardingState')) || {};
    expect(beginningOnboardingState).to.be.falsy;

    cy.getByTestId('onboardingNextSet', { force: true }).click();
    cy.getByTestId('onboardingNext', { force: true }).click();

    cy.getByTestId('onboardingNextSet', { force: true }).click();
    cy.getByTestId('onboardingNext', { force: true }).click();
    cy.getByTestId('onboardingNext', { force: true }).click();

    cy.reload().then(() => {
      const { complete, currentSet, currentStep } = JSON.parse(localStorage.getItem('OnboardingState'));
      expect(complete).to.be.false;
      expect(currentSet).to.equal(1);
      expect(currentStep).to.equal(2);
    });

    cy.getByTestId('onboardingNext', { force: true }).click();
    cy.getByTestId('onboardingNext', { force: true }).click();
    cy.getByTestId('onboardingNext', { force: true }).click();

    cy.getByTestId('onboardingNextSet', { force: true }).click();
    cy.getByTestId('onboardingNext', { force: true }).click();

    cy.getByTestId('onboardingNextSet', { force: true }).click();
    cy.getByTestId('onboardingNext', { force: true }).click();

    cy.getByTestId('onboardingNextSet', { force: true }).click();
    cy.getByTestId('onboardingNext', { force: true }).click();

    cy.getByTestId('onboardingDone', { force: true }).click().then(() => {
      const { complete } = JSON.parse(localStorage.getItem('OnboardingState'));
      expect(complete).to.be.true;
    });
  });
  
  it('can cancel onboarding', () => {
    cy.get('.ms-Overlay').click();
    cy.getByTestId('cancelPrompt').click();
    cy.get('.ms-Overlay').click();
    cy.getByTestId('confirmPrompt').click();
    cy.getByTestId('LeftNav-CommandBarButtonHome').click().then(() => {
      const { complete } = JSON.parse(localStorage.getItem('OnboardingState'));
      expect(complete).to.be.true;
    });
  });

  it('can start onboarding from settings', () => {
    cy.get('.ms-Overlay').click();
    cy.getByTestId('confirmPrompt').click();
    cy.getByTestId('LeftNav-CommandBarButtonSettings').click();
    cy.getByText('Onboarding').click();
    cy.getByTestId('onboardingToggle').click();
    cy.getByTestId('onboardingNextSet', { force: true }).click();
  });
});
