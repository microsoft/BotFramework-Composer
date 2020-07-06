// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from '@bfc/test-utils';
import { createHistory, createMemorySource, LocationProvider } from '@reach/router';

import { App } from '../src/App';

import { wrapWithRecoil } from './testUtils';

function renderWithRouter(ui, { route = '/dialogs/home', history = createHistory(createMemorySource(route)) } = {}) {
  return {
    ...render(<LocationProvider history={history}>{ui}</LocationProvider>),
    history,
  };
}

const AppTest = () => <App />;

describe('<Router/> router test', () => {
  it('full app rendering/navigating', () => {
    const {
      container,
      history: { navigate },
    } = renderWithRouter(wrapWithRecoil(<AppTest />));

    const appContainer = container;
    expect(appContainer.innerHTML).toMatch('Bot Framework Composer');

    navigate('/language-understanding');
    expect(appContainer.innerHTML).toMatch('Setting');

    navigate('/something-that-does-not-match');
    expect(appContainer.innerHTML).toMatch('404');
  });
});
