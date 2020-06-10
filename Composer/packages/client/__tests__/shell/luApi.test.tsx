// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { renderHook } from '@bfc/test-utils/lib/hooks';

import { useLuApi } from '../../src/shell/luApi';
import { useStoreContext } from '../../src/hooks/useStoreContext';

jest.mock('../../src/hooks/useStoreContext', () => ({
  useStoreContext: jest.fn(),
}));

jest.mock('../../src/store/parsers/luWorker', () => {
  return { addIntent: (a, b) => b.Body, updateIntent: (a, b, c) => c.Body, removeIntent: (a, b) => b };
});

const state = {
  luFiles: [
    {
      content: 'test',
      id: 'test.en-us',
      intents: [{ Body: '- test12345', Entities: [], Name: 'test' }],
    },
  ],
  focusPath: '',
  locale: 'en-us',
  projectId: 'test',
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

describe('use luApi hooks', () => {
  it('should call add lu intent action', () => {
    const { result } = renderHook(() => useLuApi());

    result.current.addLuIntent('test.en-us', 'test', { Body: '- test add', Name: 'add' }).then(() => {
      expect(actions.updateLuFile).toBeCalledTimes(1);
      const arg = { content: '- test add', id: 'test.en-us', projectId: 'test' };
      expect(actions.updateLuFile).toBeCalledWith(arg);
    });
  });

  it('should call update lu intent action', () => {
    const { result } = renderHook(() => useLuApi());

    result.current.updateLuIntent('test.en-us', 'test', { Body: '- test update', Name: 'update' }).then(() => {
      expect(actions.updateLuFile).toBeCalledTimes(2);
      const arg = { content: '- test update', id: 'test.en-us', projectId: 'test' };
      expect(actions.updateLuFile).toBeCalledWith(arg);
    });
  });

  it('should call remove lu intent action', () => {
    const { result } = renderHook(() => useLuApi());

    result.current.removeLuIntent('test.en-us', 'remove').then(() => {
      expect(actions.updateLuFile).toBeCalledTimes(3);
      const arg = { content: 'remove', id: 'test.en-us', projectId: 'test' };
      expect(actions.updateLuFile).toBeCalledWith(arg);
    });
  });

  it('should get lu intents', () => {
    const { result } = renderHook(() => useLuApi());

    const intents = result.current.getLuIntents('test.en-us');

    expect(intents[0].Name).toBe('test');
  });

  it('should get lu intent', () => {
    const { result } = renderHook(() => useLuApi());

    const intent = result.current.getLuIntent('test.en-us', 'test');

    expect(intent?.Name).toBe('test');
  });
});
