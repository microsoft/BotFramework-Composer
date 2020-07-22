// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { logMessage, ConsoleMsgLevel } from '../shared';
import { logEntryListState } from '../../atoms/appState';

import { mockCallback, testAtomUpdate } from './testUtils';

describe('logMessage', () => {
  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  const MESSAGE = 'test message 12345';

  it('logs a message at Info level', () => {
    logMessage(mockCallback, MESSAGE, ConsoleMsgLevel.Info);
    expect(consoleLogSpy).toHaveBeenCalledWith(MESSAGE);
    testAtomUpdate(logEntryListState, ['a', 'b'], ['a', 'b', MESSAGE]);
  });
  it('logs a message at Info level', () => {
    logMessage(mockCallback, MESSAGE, ConsoleMsgLevel.Warn);
    expect(consoleWarnSpy).toHaveBeenCalledWith(MESSAGE);
    testAtomUpdate(logEntryListState, ['a', 'b'], ['a', 'b', MESSAGE]);
  });
  it('logs a message at Info level', () => {
    logMessage(mockCallback, MESSAGE, ConsoleMsgLevel.Error);
    expect(consoleErrorSpy).toHaveBeenCalledWith(MESSAGE);
    testAtomUpdate(logEntryListState, ['a', 'b'], ['a', 'b', MESSAGE]);
  });
  it('logs a message at the default level', () => {
    logMessage(mockCallback, MESSAGE);
    expect(consoleErrorSpy).toHaveBeenCalledWith(MESSAGE);
    testAtomUpdate(logEntryListState, ['a', 'b'], ['a', 'b', MESSAGE]);
  });
});
