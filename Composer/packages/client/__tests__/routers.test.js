import * as React from 'react';
import { render } from 'react-testing-library';
import { createHistory, createMemorySource, LocationProvider } from '@reach/router';

import Routes from '../src/router';
import { StoreProvider } from '../src/store';

export function renderWithRouter(ui, { route = '/', history = createHistory(createMemorySource(route)) } = {}) {
  return {
    ...render(<LocationProvider history={history}>{ui}</LocationProvider>),
    history,
  };
}

const App = () => (
  <StoreProvider>
    <Routes />
  </StoreProvider>
);

describe('<Router/> router test', () => {
  test('full app rendering/navigating', async () => {
    const {
      container,
      history: { navigate },
    } = renderWithRouter(<App />);

    const appContainer = container;
    expect(appContainer.innerHTML).toMatch('Dialogs');

    await navigate('/setting');
    expect(appContainer.innerHTML).toMatch('Setting');

    await navigate('/content');
    expect(appContainer.innerHTML).toMatch('Content');
  });

  test('landing on a not found', () => {
    const { container } = renderWithRouter(<App />, {
      route: '/something-that-does-not-match',
    });

    expect(container.innerHTML).toMatch('404');
  });
});
