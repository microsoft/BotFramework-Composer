// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Onboarding', () => {
  beforeEach(() => {
    window.localStorage.setItem('composer:OnboardingState', JSON.stringify({ complete: false }));

    cy.visit(`${Cypress.env('COMPOSER_URL')}/home`);
    cy.findByTestId('homePage-ToolBar-New').within(() => {
      cy.findByText('New').click();
    });

    cy.findByTestId('Create from template').click({ force: true });
    cy.findByTestId('TodoSample').click();
    cy.findByTestId('NextStepButton').click();
    cy.findByTestId('NewDialogName').type('{selectall}__TestOnboarding{enter}');

    //enable onboarding setting
    cy.visitPage('Settings');
    cy.findByText('Onboarding').click();
    cy.findByTestId('onboardingToggle').click();
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
