// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

context('breadcrumb', () => {
  beforeEach(() => {
    cy.visit('/home');
    cy.createBot('TodoSample');

    // Return to Main.dialog
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('__TestTodoSample').click();
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

  it('can show dialog name in breadcrumb', () => {
    // Should path = main dialog at first render
    hasBreadcrumbItems(cy, ['__TestTodoSample']);

    // Click on AddToDo dialog
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('addtodo').click();
    });
    hasBreadcrumbItems(cy, ['Addtodo']);

    // Return to Main.dialog
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('__TestTodoSample').click();
    });

    hasBreadcrumbItems(cy, ['__TestTodoSample']);
  });

  it('can show event name in breadcrumb', () => {
    cy.findByTestId('ProjectTree').within(() => {
      cy.findByText('addtodo').click();
      cy.findByText('Dialog started').click();
    });

    hasBreadcrumbItems(cy, ['Addtodo', 'Dialog started']);
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
