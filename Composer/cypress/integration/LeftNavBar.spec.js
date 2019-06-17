/// <reference types="Cypress" />
context('check Nav Expandion ', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('COMPOSER_URL'));
  });
  it('can expand left Nav Bar', () => {
    cy.get('[data-testid="LeftNavButton"]').click();
    cy.get('[data-testid="LeftNav-CommandBarButton0"]').should('exist');
    cy.get('[data-testid="LeftNav-CommandBarButton1"]').click();
    cy.url().should('include', 'language-generation');
    cy.get('[data-testid="LeftNav-CommandBarButton2"]').click();
    cy.url().should('include', 'language-understanding');
    cy.get('[data-testid="LeftNav-CommandBarButton3"]').click();
    cy.url().should('include', 'setting');
  });
});
