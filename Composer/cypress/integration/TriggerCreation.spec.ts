// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('Creating a new bot', () => {
    beforeEach(() => {
        cy.visit(Cypress.env('COMPOSER_URL'));
        cy.createBot('EmptyBot');
    });

    it('can create different kinds of triggers ', () => {
        cy.visitPage('Design Flow');
        cy.findByTestId('recognizerTypeDropdown').click();
        cy.findByText('Regular Expression').click();

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
        cy.findByTestId('eventTypeDropDown').within(() => {
            cy.get('.ms-ComboBox-Input').type('myTrigger2');
        });
        cy.findByTestId('triggerFormSubmit').click();
        cy.findAllByText('Custom Event').should('exist');

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
