// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Onboarding', () => {
  beforeEach(() => {
    cy.createTestBot('TestSample', ({ id }) => {
      cy.visit(`/bot/${id}`);
      //enable onboarding setting
      cy.visitPage('Composer settings');
      cy.findByTestId('ProjectTree').within(() => {
        cy.findByText('Application Settings').click();
      });
      cy.findByTestId('onboardingToggle').click();
      cy.visitPage('Design');
    });
  });

  it('walk through product tour teaching bubbles', () => {
    cy.findByTestId('onboardingNextSet').click();
    cy.findByTestId('onboardingNext').click();
    cy.findByTestId('onboardingNext').click();
    cy.findByTestId('onboardingNext').click();

    cy.findByTestId('onboardingNextSet').click();
    cy.findByTestId('onboardingNext').click();
    cy.findByTestId('onboardingNext').click();

    cy.findByTestId('onboardingNextSet').click();
    cy.findByTestId('onboardingNext').click();

    cy.findByTestId('onboardingNextSet').click();
    cy.findByTestId('onboardingNext').click();

    cy.findByTestId('onboardingDone').click();
  });
});
