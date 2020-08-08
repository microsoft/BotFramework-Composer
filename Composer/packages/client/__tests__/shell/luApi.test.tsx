// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { renderHook } from '@bfc/test-utils/lib/hooks';
import * as React from 'react';
import { RecoilRoot } from 'recoil';

import { useLuApi } from '../../src/shell/luApi';
import { projectIdState, localeState, luFilesState, dispatcherState } from '../../src/recoilModel';
import { Dispatcher } from '../../src/recoilModel/dispatchers';

jest.mock('../../src/recoilModel/parsers/luWorker', () => {
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

describe('use luApi hooks', () => {
  let updateLuFileMockMock, result;
  beforeEach(() => {
    updateLuFileMockMock = jest.fn();

    const initRecoilState = ({ set }) => {
      set(projectIdState, state.projectId);
      set(localeState, 'en-us');
      set(luFilesState, state.luFiles);
      set(dispatcherState, (current: Dispatcher) => ({
        ...current,
        updateLuFile: updateLuFileMockMock,
        removeLuIntent: updateLuFileMockMock,
        updateLuIntent: updateLuFileMockMock,
        createLuIntent: updateLuFileMockMock,
      }));
    };

    const wrapper = (props: { children?: React.ReactNode }) => {
      const { children } = props;
      return <RecoilRoot initializeState={initRecoilState}>{children}</RecoilRoot>;
    };
    const rendered = renderHook(() => useLuApi(), {
      wrapper,
    });
    result = rendered.result;
  });

  it('should call add lu intent action', async () => {
    await result.current.addLuIntent('test.en-us', 'test', { Body: '- test add', Name: 'add' });
    expect(updateLuFileMockMock).toBeCalledTimes(1);
    const arg = {
      id: 'test.en-us',
      intent: {
        Body: '- test add',
        Name: 'add',
      },
      projectId: 'test',
    };
    expect(updateLuFileMockMock).toBeCalledWith(arg);
  });

  it('should call update lu intent action', async () => {
    await result.current.addLuIntent('test.en-us', 'test', { Body: '- test add', Name: 'add' });
    expect(updateLuFileMockMock).toBeCalledTimes(1);
    await result.current.updateLuIntent('test.en-us', 'test', { Body: '- test update', Name: 'update' });
    expect(updateLuFileMockMock).toBeCalledTimes(2);
    const arg = {
      id: 'test.en-us',
      intent: {
        Body: '- test update',
        Name: 'update',
      },
      intentName: 'test',
      projectId: 'test',
    };
    expect(updateLuFileMockMock).toBeCalledWith(arg);
  });

  it('should call remove lu intent action', async () => {
    await result.current.addLuIntent('test.en-us', 'test', { Body: '- test add', Name: 'add' });
    await result.current.updateLuIntent('test.en-us', 'test', { Body: '- test update', Name: 'update' });
    await result.current.removeLuIntent('test.en-us', 'test', 'remove');
    expect(updateLuFileMockMock).toBeCalledTimes(3);
    const arg = { intentName: 'test', id: 'test.en-us', projectId: 'test' };
    expect(updateLuFileMockMock).toBeCalledWith(arg);
  });

  it('should get lu intents', () => {
    const intents = result.current.getLuIntents('test.en-us');
    expect(intents[0].Name).toBe('test');
  });

  it('should get lu intent', () => {
    const intent = result.current.getLuIntent('test.en-us', 'test');
    expect(intent?.Name).toBe('test');
  });
});
