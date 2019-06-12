import * as React from 'react';
import { render } from 'react-testing-library';
import { createHistory, createMemorySource, LocationProvider } from '@reach/router';

import { StoreProvider } from '../src/store';

import { App } from './../src/App';

function renderWithRouter(ui, { route = '/', history = createHistory(createMemorySource(route)) } = {}) {
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
  test('full app rendering/navigating', async () => {
    const {
      container,
      history: { navigate },
    } = renderWithRouter(<AppTest />);

    const appContainer = container;
    expect(appContainer.innerHTML).toMatch('Dialogs');

    await navigate('/setting');
    expect(appContainer.innerHTML).toMatch('Setting');
  });

  test('landing on a not found', () => {
    const { container } = renderWithRouter(<AppTest />, {
      route: '/something-that-does-not-match',
    });

    expect(container.innerHTML).toMatch('404');
  });
});
