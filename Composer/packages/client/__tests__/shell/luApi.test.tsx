// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { renderHook } from '@testing-library/react-hooks';
import React from 'react';

import { useLuApi } from '../../src/shell/luApi';
import { StoreContextProvider } from '../testUtils';

jest.mock('../../src/store/parsers/luWorker', () => {
  return { addIntent: (a, b) => b.Body, updateIntent: (a, b, c) => c.Body, removeIntent: (a, b) => b };
});

describe('use luApi hooks', () => {
  const updateLuFile = jest.fn((value) => value.content);

  let state;
  let wrapper: React.FunctionComponent = () => null;
  beforeEach(() => {
    state = {
      luFiles: [
        {
          content: 'test',
          id: 'test.en-us',
          intents: [{ Body: '- test12345', Entities: [], Name: 'test' }],
        },
      ],
      focusPath: '',
      locale: 'en-us',
    };

    wrapper = ({ children }) => (
      <StoreContextProvider
        actions={{ updateLuFile }}
        resolvers={{ luFileResolver: jest.fn((id) => state.luFiles.find((file) => file.id === id)) }}
        state={state}
      >
        {children}
      </StoreContextProvider>
    );
  });

  test('should call add lu intent action', () => {
    const { result } = renderHook(() => useLuApi(), { wrapper });

    result.current.addLuIntent('test.en-us', 'test', { Body: '- test add', Name: 'add' }).then(() => {
      expect(updateLuFile).toBeCalledTimes(1);
      expect(updateLuFile).toHaveReturnedWith('- test add');
    });
  });

  test('should call update lu intent action', () => {
    const { result } = renderHook(() => useLuApi(), { wrapper });

    result.current.updateLuIntent('test.en-us', 'test', { Body: '- test update', Name: 'update' }).then(() => {
      expect(updateLuFile).toBeCalledTimes(2);
      expect(updateLuFile).toHaveReturnedWith('- test update');
    });
  });

  test('should call remove lu intent action', () => {
    const { result } = renderHook(() => useLuApi(), { wrapper });

    result.current.removeLuIntent('test.en-us', 'remove').then(() => {
      expect(updateLuFile).toBeCalledTimes(3);
      expect(updateLuFile).toHaveReturnedWith('remove');
    });
  });

  test('should get lu intents', () => {
    const { result } = renderHook(() => useLuApi(), { wrapper });

    const intents = result.current.getLuIntents('test.en-us');

    expect(intents[0].Name).toBe('test');
  });

  test('should get lu intent', () => {
    const { result } = renderHook(() => useLuApi(), { wrapper });

    const intent = result.current.getLuIntent('test.en-us', 'test');

    expect(intent?.Name).toBe('test');
  });
});
