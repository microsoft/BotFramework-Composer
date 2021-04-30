// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { renderHook } from '@botframework-composer/test-utils/lib/hooks';

import { useDebugPane } from '../useDebugPane';

const mockLocation = jest.fn(() => {
  return {
    location: {
      pathname: 'home',
    },
  };
});

jest.mock('../../utils/hooks.ts', () => ({
  useLocation: () => mockLocation(),
}));

// TODO: An integration test needs to be added to test this component better.
describe('useDebug pane', () => {
  it('should render debug pane in dialogs page', async () => {
    mockLocation.mockReturnValue({
      location: {
        pathname: '/bot/43925.21156467697/dialogs/conversational_core_1',
      },
    });
    const { result } = renderHook(() => useDebugPane());
    expect(result.current).toBeTruthy();
  });

  it('should not render debug pane in package manager page', async () => {
    mockLocation.mockReturnValue({
      location: {
        pathname: '/bot/43925.21156467697/plugin/package-manager',
      },
    });
    const { result } = renderHook(() => useDebugPane());
    expect(result.current).toBeFalsy();
  });

  it('should render in skills LG Page', async () => {
    mockLocation.mockReturnValue({
      location: {
        pathname: '/bot/43925.21156467697/skill/88276.36979482269/language-generation/People',
      },
    });
    const { result } = renderHook(() => useDebugPane());
    expect(result.current).toBeTruthy();
  });

  it('should render in skills LU Page', async () => {
    mockLocation.mockReturnValue({
      location: {
        pathname: '/bot/43925.21156467697/skill/88276.36979482269/language-understanding/People',
      },
    });
    const { result } = renderHook(() => useDebugPane());
    expect(result.current).toBeTruthy();
  });
});
