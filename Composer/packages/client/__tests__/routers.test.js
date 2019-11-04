// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { render } from 'react-testing-library';
import { createHistory, createMemorySource, LocationProvider } from '@reach/router';

import { StoreProvider } from '../src/store';

import { App } from './../src/App';

function renderWithRouter(ui, { route = '/dialogs/home', history = createHistory(createMemorySource(route)) } = {}) {
  return {
    ...render(<LocationProvider history={history}>{ui}</LocationProvider>),
    history,
  };
}

const AppTest = () => (
  <StoreProvider>
    <App />
  </StoreProvider>
);

describe('<Router/> router test', () => {
  test('full app rendering/navigating', () => {
    const {
      container,
      history: { navigate },
    } = renderWithRouter(<AppTest />);

    const appContainer = container;
    expect(appContainer.innerHTML).toMatch('Bot Framework Composer');

    navigate('/language-understanding');
    expect(appContainer.innerHTML).toMatch('Setting');
  });

  test('landing on a not found', () => {
    const { container } = renderWithRouter(<AppTest />, {
      route: '/something-that-does-not-match',
    });

    expect(container.innerHTML).toMatch('404');
  });
});
