/// <reference types="Cypress" />

context('SwitchCondition', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.copyBot('ToDoLuisBot', 'SwitchConditionSpec');
  });

  it('can manage cases', () => {
    // Add switch condition
    cy.withinEditor('FormEditor', () => {
      cy.get('[data-testid="StepsFieldAdd"]').click();
      cy.getByText('Flow').click();
      cy.getByText('Branch: Multi-path Switch').click();
    });
    // Focus switch condition in form editor
    cy.withinEditor('VisualEditor', () => {
      cy.getByTestId('SwitchConditionDiamond').click({ force: true });
    });
    // Add case and add/delete/edit steps
    cy.withinEditor('FormEditor', () => {
      // Edit condition
      cy.getByLabelText('Condition').type('user.age >= 21');

      // Add new case
      cy.getByText('Add New Case').click();
      cy.getByLabelText('Value')
        .type('Case1')
        .type('{enter}');

      // Add some steps

      // Send activity
      cy.getByText('Add New Step for Case1').click();
      cy.getByText('Send Messages').click();
      cy.getByText('Send a single message').click();

      // Edit array
      cy.getByText('Add New Step for Case1').click();
      cy.getByText('Memory manipulation').click();
      cy.getByText('Edit an array property').click();

      // Log step
      cy.getByText('Add New Step for Case1').click();
      cy.getByText('Debugging').click();
      cy.getByText('Log a message to the console').click();

      cy.get('[data-automationid="DetailsRow"]')
        .as('steps')
        .should('have.length', 3);

      // re-order steps
      const btn0 = cy
        .get('@steps')
        .eq(0)
        .find('button')
        .click();
      // btn0.click();
      btn0.invoke('attr', 'aria-owns').then(menuId => {
        cy.get(`#${menuId}`)
          .getByText('Move Down')
          .click();
      });

      const btn2 = cy
        .get('@steps')
        .eq(2)
        .find('button')
        .click();
      // btn2.click();
      btn2.invoke('attr', 'aria-owns').then(menuId => {
        cy.get(`#${menuId}`)
          .getByText('Move Up')
          .click();
      });

      // assert that the steps are in correct order
      cy.get('@steps')
        .get('[data-automationid="DetailsRowCell"][data-automation-key="name"]')
        .eq(0)
        .should('contain.text', 'Microsoft.EditArray');
      cy.get('@steps')
        .get('[data-automationid="DetailsRowCell"][data-automation-key="name"]')
        .eq(1)
        .should('contain.text', 'Microsoft.LogStep');
      cy.get('@steps')
        .get('[data-automationid="DetailsRowCell"][data-automation-key="name"]')
        .eq(2)
        .should('contain.text', 'Microsoft.SendActivity');

      // Add another new case
      cy.getByText('Add New Case').click();
      cy.getByLabelText('Value')
        .type('Case2')
        .type('{enter}');

      // move first case
      let btn = cy
        .get('.CasesFieldConditionsMenu')
        .first()
        .find('button');
      btn.click();
      btn.invoke('attr', 'aria-owns').then(menuId => {
        cy.get(`#${menuId}`)
          .getByText('Move Down')
          .click();
      });

      cy.get('[role="separator"]')
        .should('have.length', 3)
        .eq(1)
        .should('have.text', 'Case1');

      // remove case1
      btn = cy
        .get('.CasesFieldConditionsMenu')
        .first()
        .find('button');
      btn.click();
      btn.invoke('attr', 'aria-owns').then(menuId => {
        cy.get(`#${menuId}`)
          .getByText('Remove')
          .click();
      });

      cy.get('[role="separator"]')
        .should('have.length', 2)
        .eq(1)
        .should('have.text', 'Default');
    });
  });
});
