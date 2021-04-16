// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('breadcrumb', () => {
  beforeEach(() => {
    cy.createBotV2('EmptySample', ({ id }) => {
      cy.visit(`/bot/${id}`);
    });
  });

  function hasBreadcrumbItems(cy: Cypress.cy, items: (string | RegExp)[]) {
    cy.get('[data-testid="Breadcrumb"]')
      .last()
      .get('li')
      .should(($li) => {
        items.forEach((item, idx) => {
          expect($li.eq(idx)).to.contain(item);
        });
      });
  }

  it('can show dialog, trigger, action in breadcrumb', () => {
    // Should path = main dialog at first render
    hasBreadcrumbItems(cy, ['__TestEmptySample']);

    // Click on an trigger
    cy.findByTestId('ProjectTree').within(() => {
      cy.findAllByText('Greeting').last().click();
    });

    hasBreadcrumbItems(cy, ['__TestEmptySample', 'Greeting']);

    // Click on an action
    cy.withinEditor('VisualEditor', () => {
      cy.findByTestId('RuleEditor').within(() => {
        cy.findByText('Send a response').click();
      });
    });

    hasBreadcrumbItems(cy, ['__TestEmptySample', 'Greeting', 'Send a response']);
  });
});
