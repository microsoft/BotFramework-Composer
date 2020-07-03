// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { renderHook } from '@bfc/test-utils/lib/hooks';

import { useStoreContext } from '../../../src/hooks/useStoreContext';
import useNotifications from '../../../src/pages/notifications/useNotifications';

jest.mock('../../../src/hooks/useStoreContext', () => ({
  useStoreContext: jest.fn(),
}));

const state = {
  projectId: 'test',
  dialogs: [
    {
      id: 'test',
      content: 'test',
      luFile: 'test',
      referredLuIntents: [],
      diagnostics: [
        {
          message: 'must be an expression',
          path: 'test.triggers[0]#Microsoft.OnUnknownIntent#condition',
          severity: 1,
          source: 'test',
        },
      ],
    },
  ],
  luFiles: [
    {
      content: 'test',
      id: 'test.en-us',
      intents: [
        {
          Body: '- test12345 ss',
          Entities: [],
          Name: 'test',
          range: {
            endLineNumber: 7,
            startLineNumber: 4,
          },
        },
      ],
      diagnostics: [
        {
          message: 'lu syntax error',
          severity: 0,
          source: 'test.en-us',
          range: {
            end: { character: 2, line: 7 },
            start: { character: 0, line: 7 },
          },
        },
      ],
    },
  ],
  lgFiles: [
    {
      content: 'test',
      id: 'test.en-us',
      templates: [
        {
          body: '- ${add(1,2)}',
          name: 'bar',
          range: { endLineNumber: 0, startLineNumber: 0 },
        },
      ],
      diagnostics: [
        {
          message: 'lg syntax error',
          severity: 1,
          source: 'test.en-us',
          range: {
            end: { character: 2, line: 13 },
            start: { character: 0, line: 13 },
          },
        },
      ],
    },
  ],
  diagnostics: [
    {
      message: 'server error',
      severity: 0,
      source: 'server',
    },
  ],
};

const resolvers = { luFileResolver: jest.fn((id) => state.luFiles.find((file) => file.id === id)) };

const actions = {
  updateLuFile: jest.fn(),
};

(useStoreContext as jest.Mock).mockReturnValue({
  state,
  resolvers,
  actions,
});

describe('useNotification hooks', () => {
  it('should return notifications', () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.length).toBe(4);
  });

  it('should return filtered notifications', () => {
    const { result } = renderHook(() => useNotifications('Error'));

    expect(result.current.length).toBe(2);
  });
});
