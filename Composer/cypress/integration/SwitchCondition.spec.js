/// <reference types="Cypress" />

context('SwitchCondition', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.copyBot('01 - Steps', 'SwitchConditionSpec');
  });

  it('can manage cases', () => {
    // Add switch condition
    cy.withinEditor('FormEditor', () => {
      cy.getByText('Add New Step').click();
      cy.getByText('Conversational flow and dialog management').click();
      cy.getByText('Microsoft.SwitchCondition').click();
    });

    // Focus switch condition in form editor
    cy.withinEditor('VisualEditor', () => {
      cy.getByTestId('SwitchConditionDiamond').click();
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
      cy.getByText('Sending a response').click();
      cy.getByText('Microsoft.SendActivity').click();

      // Edit array
      cy.getByText('Add New Step for Case1').click();
      cy.getByText('Memory manipulation').click();
      cy.getByText('Microsoft.EditArray').click();

      // Log step
      cy.getByText('Add New Step for Case1').click();
      cy.getByText('Tracing and logging').click();
      cy.getByText('Microsoft.LogStep').click();

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
        .eq(0)
        .should('contain.text', 'Microsoft.EditArray');
      cy.get('@steps')
        .eq(1)
        .should('contain.text', 'Microsoft.LogStep');
      cy.get('@steps')
        .eq(2)
        .should('contain.text', 'Microsoft.SendActivity');

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
