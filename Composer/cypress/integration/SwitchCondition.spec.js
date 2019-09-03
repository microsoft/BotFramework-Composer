/// <reference types="Cypress" />

context('SwitchCondition', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.startFromTemplate('EmptyBot', 'SwitchConditionSpec');
  });

  //will remove skip after add trigger is ok
  it('can manage cases', () => {
    cy.addEventHandler('Handle Unknown Intent');

    cy.withinEditor('VisualEditor', () => {
      cy.getByText(/OnUnknownIntent/).click({ force: true });
      cy.wait(100);
      cy.getByText(/UnknownIntent/).click({ force: true });
      cy.wait(100);
      cy.getByTestId('StepGroupAdd').click({ force: true });
      cy.getByText('Flow').click({ force: true });
      cy.getByText('Branch: Switch').click({ force: true });
      cy.getByTestId('SwitchConditionDiamond').click({ force: true });
    });

    // Add case and add/delete/edit steps
    cy.withinEditor('FormEditor', () => {
      // Edit condition
      cy.getByLabelText('Condition').type('user.age >= 21');

      // Add new case
      cy.getByText('Add New Case').click({ force: true });
      cy.getByLabelText('Value')
        .type('Case1')
        .type('{enter}');

      // Add some steps

      // Send activity
      // Use { force: true } can disable error checking like dom not visible or width and height '0 * 0' pixels.
      // So if a button is in a popup window, using { force: true } to button click can make the tests more stable.
      cy.getByText('Add New Step for Case1').click({ force: true });
      cy.getByText('Send Messages').click({ force: true });
      cy.getByText('Send an Activity').click({ force: true });

      // Edit array
      cy.getByText('Add New Step for Case1').click({ force: true });
      cy.getByText('Memory manipulation').click({ force: true });
      cy.getByText('Edit an Array Property').click({ force: true });

      // Log step
      cy.getByText('Add New Step for Case1').click({ force: true });
      cy.getByText('Debugging').click({ force: true });
      cy.getByText('Log to console').click({ force: true });

      cy.get('[data-automationid="DetailsRow"]')
        .as('steps')
        .should('have.length', 3);

      // re-order steps
      const btn0 = cy
        .get('@steps')
        .eq(0)
        .find('button')
        .click({ force: true });
      btn0.invoke('attr', 'aria-owns').then(menuId => {
        cy.get(`#${menuId}`)
          .getByText('Move Down')
          .click({ force: true });
        cy.wait(100);
      });

      const btn2 = cy
        .get('@steps')
        .eq(2)
        .find('button')
        .click({ force: true });
      btn2.invoke('attr', 'aria-owns').then(menuId => {
        cy.get(`#${menuId}`)
          .getByText('Move Up')
          .click({ force: true });
        cy.wait(100);
      });

      // assert that the steps are in correct order
      cy.get('@steps')
        .get('[data-automationid="DetailsRowCell"][data-automation-key="name"]')
        .eq(0)
        .should('contain.text', 'Edit an Array Property');
      cy.get('@steps')
        .get('[data-automationid="DetailsRowCell"][data-automation-key="name"]')
        .eq(1)
        .should('contain.text', 'Log to console');
      cy.get('@steps')
        .get('[data-automationid="DetailsRowCell"][data-automation-key="name"]')
        .eq(2)
        .should('contain.text', 'Send an Activity');

      // Add another new case
      cy.getByText('Add New Case').click({ force: true });
      cy.wait(100);
      cy.getByLabelText('Value')
        .type('Case2')
        .type('{enter}');

      cy.wait(100);

      // move first case
      let btn = cy
        .get('.CasesFieldConditionsMenu')
        .first()
        .find('button');
      btn.click({ force: true });
      btn.invoke('attr', 'aria-owns').then(menuId => {
        cy.get(`#${menuId}`)
          .getByText('Move Down')
          .click({ force: true });
        cy.wait(100);
      });

      cy.get('[role="separator"]:contains(Branch)')
        .filter(':not(:contains(Branch: Switch))')
        .should('have.length', 3)
        .eq(1)
        .should('have.text', 'Branch: Case1');

      cy.wait(100);

      // remove case1
      btn = cy
        .get('.CasesFieldConditionsMenu')
        .first()
        .find('button');
      btn.click({ force: true });
      btn.invoke('attr', 'aria-owns').then(menuId => {
        cy.get(`#${menuId}`)
          .getByText('Remove')
          .click({ force: true });
        cy.wait(100);
      });

      cy.get('[role="separator"]:contains(Branch)')
        .filter(':not(:contains(Branch: Switch))')
        .should('have.length', 2)
        .eq(1)
        .should('have.text', 'Default Branch');
    });
  });
});
