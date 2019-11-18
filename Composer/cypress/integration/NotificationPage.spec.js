/// <reference types="Cypress" />

context('check notifications page', () => {
	beforeEach(() => {
		cy.visit(Cypress.env('COMPOSER_URL'));
		cy.createBot('TodoSample');
	});

	it('can show lg syntax error ', () => {
		cy.visitPage("Bot Responses");
		// left nav tree
		cy.contains('TodoSample.Main');
		cy.contains('All');

		cy.get('.toggleEditMode button').click();
		cy.get('textarea').type('test lg syntax error');

		cy.visitPage("Notifications");

		cy.get('[data-testid="notifications-table-view"]').within(() => {
			cy.getByText('common.lg').should('exist');
		});

	});
});
