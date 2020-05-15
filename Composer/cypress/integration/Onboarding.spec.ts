// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Onboarding', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.createBot('TodoSample', 'Onboarding');

    //enable onboarding setting
    cy.visitPage('Settings');
    cy.findByText('App Settings').click();
    cy.findByLabelText('Onboarding').click();
    cy.visitPage('Design Flow');
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
