// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { convertAbsolutePathToFileProtocol, convertFileProtocolToPath } from '../../src/fileUtils';

it('should convert a posix path to file protocol', () => {
  const testPath = '/Users/tester/empty-bot-0';
  expect(convertAbsolutePathToFileProtocol(testPath)).toBe('file:///Users/tester/empty-bot-0');
});

it('should convert a windows path to file protocol', () => {
  const testPath = 'C:/Users/Tester/empty-bot-0';
  expect(convertAbsolutePathToFileProtocol(testPath)).toBe('file:///C:/Users/Tester/empty-bot-0');
});

it('should convert a Windows file protocol path to regular path', () => {
  const testPath = 'file:///C:/Users/Tester/empty-bot-0';
  expect(convertFileProtocolToPath(testPath)).toBe('C:/Users/Tester/empty-bot-0');
});

it('should convert a Mac file protocol path to regular path', () => {
  const testPath = 'file:///users/tester/empty-bot-0';
  expect(convertFileProtocolToPath(testPath)).toBe('/users/tester/empty-bot-0');
});

it('should give empty string if path is not available', () => {
  const testPath = '';
  expect(convertFileProtocolToPath(testPath)).toBe('');
});
