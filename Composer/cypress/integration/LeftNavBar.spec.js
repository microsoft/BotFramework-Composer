/// <reference types="Cypress" />
context('check Nav Expandion ', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
    cy.openBot('ToDoBot');
  });

  it('can expand left Nav Bar', () => {
    cy.get('[data-testid="LeftNavButton"]').click();
    cy.get('[data-testid="LeftNav-CommandBarButtonDesign Flow"]').should('exist');
    cy.get('[data-testid="LeftNav-CommandBarButtonBot Says"]').click();
    cy.url().should('include', 'language-generation');
    cy.get('[data-testid="LeftNav-CommandBarButtonUser Says"]').click();
    cy.url().should('include', 'language-understanding');
    cy.get('[data-testid="LeftNav-CommandBarButtonSettings"]').click();
    cy.url().should('include', 'setting');
  });
});
