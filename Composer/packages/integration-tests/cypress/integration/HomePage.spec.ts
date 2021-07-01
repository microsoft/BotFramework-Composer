// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// Tests for bot create, save, page navigation, creation flow modal.

context('Home Page ', () => {
  beforeEach(() => {
    cy.visit('/home');
  });

  it('can open buttons in home page', () => {
    cy.findByTestId('LeftNav-CommandBarButtonHome').click();
    cy.findByTestId('homePage-Toolbar-New').click();
    cy.findByTestId('CreateBotCancelButton').should('exist');
    cy.findByTestId('CreateBotCancelButton').click();
    cy.findByTestId('homePage-Toolbar-Open').click();
    cy.findByText('Select a Bot').should('exist');
    cy.findByTestId('OpenBotCancelButton').should('exist');
    cy.findByTestId('OpenBotCancelButton').click();
    cy.findByTestId('homePage-Toolbar-New').click();
  });

  // page navigation
  it('can expand left Nav Bar', () => {
    cy.createTestBot('EmptySample', ({ id }) => {
      cy.visit(`/bot/${id}`);
      cy.findByTestId('LeftNavButton').click();
      cy.findByTestId('LeftNav-CommandBarButtonCreate').should('exist');
      cy.findByTestId('LeftNav-CommandBarButtonBot responses').click();
      cy.url().should('include', 'language-generation');
      cy.findByTestId('LeftNav-CommandBarButtonUser input').click();
      cy.url().should('include', 'language-understanding');
      cy.findByTestId('LeftNav-CommandBarButtonComposer settings').click();
      cy.url().should('include', 'setting');
    });
  });

  // creation flow
  it('should open Select Template window from a url', () => {
    cy.visit('/projects/create');
    cy.findAllByTestId('dotnetFeed').should('exist');
  });

  it('should open Define Conversations window from a url', () => {
    cy.visit('/projects/create/dotnet/conversationalCore');
    cy.get('[data-testid="NewDialogName"]').should('be.visible');
  });

  it('should create the Open a Bot window from a location through the specified url', () => {
    cy.visit('/projects/open');
    cy.get('[data-testid="SelectLocation"]').should('be.visible');
  });

  it('can create a new bot', () => {
    cy.visit('/home');
    cy.findByTestId('LeftNav-CommandBarButtonHome').click();
    cy.findByTestId('homePage-Toolbar-New').within(() => {
      cy.findByText('Create new').click();
    });
    cy.wait(3000);
    cy.findByTestId('@microsoft/generator-bot-empty').click();
    cy.findByTestId('CreateBotNextStepButton').click();
    cy.findByTestId('NewDialogRuntimeType').click();
    cy.findByText('Azure Web App').click();
    cy.enterTextAndSubmit('NewDialogName', 'TestNewProject3', 'SubmitNewBotBtn');
    cy.wait(100000);
    cy.findByTestId('ProjectTree').within(() => {
      cy.findAllByText('TestNewProject3').should('exist');
    });
  });

  // We are disabling this test since we are temporarily removing
  // this feature in R13 since we don't have a clear definition or solution
  // for copying parent bots and skills.
  xit('can save as a new bot from an existing bot', () => {
    cy.createTestBot('EmptySample', ({ id }) => {
      cy.visit(`/bot/${id}`);
      cy.findByTestId('LeftNav-CommandBarButtonHome').click();
      cy.url().should('contain', 'home');
      cy.findByText('Save as').click();
      cy.enterTextAndSubmit('NewDialogName', 'TestSaveAs', 'SubmitNewBotBtn');
      cy.wait(5000);
      cy.findByTestId('ProjectTree').within(() => {
        cy.findAllByText('TestSaveAs').should('exist');
      });
    });
  });
});
