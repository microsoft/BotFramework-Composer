// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Onboarding', () => {
  beforeEach(() => {
    cy.visit('/home');
    cy.createBot('TodoSample', 'Onboarding');
    cy.visitPage('Design');
    //enable onboarding setting
    cy.visitPage('Settings');
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('Application Settings').click();
    });
    cy.findByTestId('onboardingToggle').click();
    cy.visitPage('Design');
  });

  it('walk through product tour teaching bubbles', () => {
    cy.findByTestId('onboardingNextSet').click();
    cy.findByTestId('onboardingNext').click();
    cy.findByTestId('onboardingNext').click();
    cy.findByTestId('onboardingNext').click();
    cy.findByTestId('onboardingNext').click();
    cy.findByTestId('onboardingNext').click();

    cy.findByTestId('onboardingNextSet').click();
    cy.findByTestId('onboardingNext').click();

    cy.findByTestId('onboardingNextSet').click();

    cy.findByTestId('onboardingNext').click();

    cy.findByTestId('onboardingNextSet').click();

    cy.findByTestId('onboardingNext').click();

    cy.findByTestId('onboardingDone').click();
  });
});
