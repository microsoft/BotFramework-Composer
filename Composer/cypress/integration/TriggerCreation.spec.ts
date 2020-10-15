// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Creating a new trigger', () => {
  beforeEach(() => {
    cy.visit('/home');
    cy.createBot('EmptyBot');
  });

  it('can create different kinds of triggers ', () => {
    cy.visitPage('Design');
    cy.findByTestId('recognizerTypeDropdown').click();
    cy.findByText('Regular expression recognizer').click();

    //onintent trigger
    cy.findByTestId('AddFlyout').click();
    cy.findByTestId('FlyoutNewTrigger').click();
    cy.findByTestId('triggerTypeDropDown').click();
    cy.get('[title="Intent recognized"]').click();
    cy.findByTestId('TriggerName').type('myTrigger1');
    cy.findByTestId('RegExField').type('test');
    cy.findByTestId('triggerFormSubmit').click();
    cy.findAllByText('myTrigger1').should('exist');

    //on Dialog Event trigger
    cy.findByTestId('AddFlyout').click();
    cy.findByTestId('FlyoutNewTrigger').click();
    cy.findByTestId('triggerTypeDropDown').click();
    cy.get('[title="Dialog events"]').click();
    cy.findByTestId('eventTypeDropDown').click();
    cy.findByText('Dialog started (Begin dialog event)').click();
    cy.findByTestId('triggerFormSubmit').click();
    cy.findAllByText('Begin dialog event').should('exist');

    // custom event
    cy.findByTestId('AddFlyout').click();
    cy.findByTestId('FlyoutNewTrigger').click();
    cy.findByTestId('triggerTypeDropDown').click();
    cy.get('[title="Custom events"]').click();
    cy.findByTestId('CustomEventName').type('myCustomEvent');
    cy.findByTestId('triggerFormSubmit').click();
    cy.findAllByText('myCustomEvent').should('exist');

    //on activity trigger
    cy.findByTestId('AddFlyout').click();
    cy.findByTestId('FlyoutNewTrigger').click();
    cy.findByTestId('triggerTypeDropDown').click();
    cy.get('[title="Activities"]').click();
    cy.findByTestId('activityTypeDropDown').click();
    cy.findByText('Activities (Activity received)').click();
    cy.findByTestId('triggerFormSubmit').click();
    cy.findAllByText('Activities').should('exist');
  });
});
