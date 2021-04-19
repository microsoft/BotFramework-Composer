// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('breadcrumb', () => {
  beforeEach(() => {
    cy.visit('/home');
    cy.createBot('TodoSample');

    // Return to Main.dialog
    cy.findByTestId('ProjectTree').within(() => {
      cy.findAllByText('__TestTodoSample').last().click();
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

  it('can show dialog name in breadcrumb', () => {
    // Should path = main dialog at first render
    hasBreadcrumbItems(cy, ['__TestTodoSample']);

    // Return to Main.dialog
    cy.findByTestId('ProjectTree').within(() => {
      cy.findAllByText('__TestTodoSample').last().click();
    });

    hasBreadcrumbItems(cy, ['__TestTodoSample']);
  });

  it('can show dialog and trigger name in breadcrumb', () => {
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByTestId('addtodo_Dialog started').click();
    });

    hasBreadcrumbItems(cy, ['addtodo', 'Dialog started']);
  });

  it('can show action name in breadcrumb', () => {
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('Greeting').click();
    });

    // Click on an action
    cy.withinEditor('VisualEditor', () => {
      cy.findByTestId('RuleEditor').within(() => {
        cy.findByText('Send a response').click();
      });
    });

    hasBreadcrumbItems(cy, ['__TestTodoSample', 'Greeting', 'Send a response']);
  });
});
