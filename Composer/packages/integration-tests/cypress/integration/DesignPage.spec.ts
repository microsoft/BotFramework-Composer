// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// Tests for dialog & trigger CRUD

context('breadcrumb', () => {
  beforeEach(() => {
    cy.createTestBot('TestSample', ({ id }) => {
      cy.visit(`/bot/${id}`);
    });
  });

  function hasBreadcrumbItems(cy: Cypress.cy, items: (string | RegExp)[]) {
    cy.get('[data-testid="Breadcrumb"]')
      .last()
      .within(() => {
        cy.get('li').should(($li) => {
          items.forEach((item, idx) => {
            expect($li.eq(idx)).to.contain(item);
          });
        });
      });
  }

  it('can show dialog, trigger, action in breadcrumb', () => {
    // Should path = main dialog at first render
    hasBreadcrumbItems(cy, ['TestBot_TestSample']);

    // Click on an trigger
    cy.findByTestId('ProjectTree').within(() => {
      cy.findAllByText('Greeting').last().click();
    });

    hasBreadcrumbItems(cy, ['TestBot_TestSample', 'Greeting']);

    // Click on an action
    cy.withinEditor('VisualEditor', () => {
      cy.findByTestId('RuleEditor').within(() => {
        cy.findByText('Send a response').click();
      });
    });

    hasBreadcrumbItems(cy, ['TestBot_TestSample', 'Greeting', 'Send a response']);
  });

  it('can create / remove dialog from project tree', () => {
    // create
    cy.findByTestId('BotHeader-TestBot_TestSample').within(() => {
      cy.findByTestId('dialogMoreButton').click({ force: true });
    });
    cy.findAllByText('Add a dialog').click({ force: true });
    cy.findByTestId('NewDialogName').type('{selectall}TestNewDialog2{enter}');
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('TestNewDialog2').should('exist');
    });

    // remove
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByTestId('$Root_TestNewDialog2').within(() => {
        cy.findByTestId('dialogMoreButton').first().invoke('attr', 'style', 'visibility: visible').click();
      });
    });

    cy.findByText('Remove this dialog').click();

    cy.findByText('Yes').click();

    cy.findByTestId('ProjectTree').within(() => {
      cy.get('[title="TestNewDialog2"]').should('not.exist');
    });
  });

  it('can create different kinds of triggers ', () => {
    cy.visitPage('Create');
    cy.findByTestId('DialogHeader-TestBot_TestSample').click();
    // cy.findByText('Change').click();
    cy.findByTestId('openRecognizerDialog').click();
    cy.findByText('Regular expression').click();
    cy.findByText('Done').click();

    //onintent trigger
    cy.findByTestId('DialogHeader-TestBot_TestSample').within(() => {
      cy.findByTestId('dialogMoreButton').click({ force: true });
    });
    cy.findAllByText('Add new trigger').click({ force: true });
    cy.findByTestId('triggerTypeDropDown').click();
    cy.get('[title="Intent recognized"]').click();
    cy.findByTestId('TriggerName').type('myTrigger1');
    cy.findByTestId('RegExField').type('test');
    cy.findByTestId('triggerFormSubmit').click();
    cy.findAllByText('myTrigger1').should('exist');

    //on Dialog Event trigger
    cy.findByTestId('DialogHeader-TestBot_TestSample').within(() => {
      cy.findByTestId('dialogMoreButton').click({ force: true });
    });
    cy.findAllByText('Add new trigger').click({ force: true });
    cy.findByTestId('triggerTypeDropDown').click();
    cy.get('[title="Dialog events"]').click();
    cy.findByText('Select an event type').click();
    cy.findByText('Dialog started (Begin dialog event)').click();
    cy.findByTestId('triggerFormSubmit').click();
    cy.findAllByText('Begin dialog event').should('exist');

    // custom event
    cy.findByTestId('DialogHeader-TestBot_TestSample').within(() => {
      cy.findByTestId('dialogMoreButton').click({ force: true });
    });
    cy.findAllByText('Add new trigger').click({ force: true });
    cy.findByTestId('triggerTypeDropDown').click();
    cy.get('[title="Custom events"]').click();
    cy.findByTestId('CustomEventName').type('myCustomEvent');
    cy.findByTestId('triggerFormSubmit').click();
    cy.findAllByText('myCustomEvent').should('exist');

    //on activity trigger
    cy.findByTestId('DialogHeader-TestBot_TestSample').within(() => {
      cy.findByTestId('dialogMoreButton').click({ force: true });
    });
    cy.findAllByText('Add new trigger').click({ force: true });
    cy.findByTestId('triggerTypeDropDown').click();
    cy.get('[title="Activities"]').click();
    cy.findByText('Select an activity type').click();
    cy.findByText('Activities (Activity received)').click();
    cy.findByTestId('triggerFormSubmit').click();
    cy.findAllByText('Activities').should('exist');
  });

  it('can find Visual Designer default trigger in container', () => {
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('Greeting').click();
    });

    cy.withinEditor('VisualEditor', () => {
      cy.findByText('ConversationUpdate activity').should('exist');
    });
  });
});
