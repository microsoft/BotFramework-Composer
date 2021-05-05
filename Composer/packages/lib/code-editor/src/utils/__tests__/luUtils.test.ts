// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { isSelectionWithinBrackets } from '../luUtils';

describe('luUtils', () => {
  it('selectionContainedInBrackets: return true when selection is within brackets', () => {
    const line = '- foo {bar} baz';
    const selection = { startColumn: 8, endColumn: 11 };
    expect(isSelectionWithinBrackets(line, selection, 'bar')).toBeTruthy();
  });
  it('selectionContainedInBrackets: return false when selection is not within brackets', () => {
    const line = '- foo {bar} baz';
    const selection = { startColumn: 3, endColumn: 6 };
    expect(isSelectionWithinBrackets(line, selection, 'foo')).toBeFalsy();
  });
  it('selectionContainedInBrackets return false when selection is between sets of brackets:', () => {
    const line = '- {baz} foo {bar}';
    const selection = { startColumn: 9, endColumn: 12 };
    expect(isSelectionWithinBrackets(line, selection, 'foo')).toBeFalsy();
  });
  it('selectionContainedInBrackets: return false when selection is within escaped brackets', () => {
    const line = '- foo \\{bar\\}';
    const selection = { startColumn: 10, endColumn: 13 };
    expect(isSelectionWithinBrackets(line, selection, 'bar')).toBeFalsy();
  });
  it('selectionContainedInBrackets: return false when selection is within escaped brackets', () => {
    const line = '\\{bar\\}';
    const selection = { startColumn: 3, endColumn: 5 };
    expect(isSelectionWithinBrackets(line, selection, 'bar')).toBeFalsy();
  });
  it('selectionContainedInBrackets: return true when selection is within brackets', () => {
    const line = '{bar}';
    const selection = { startColumn: 2, endColumn: 4 };
    expect(isSelectionWithinBrackets(line, selection, 'bar')).toBeTruthy();
  });
  it('selectionContainedInBrackets: return true when selection contains bracket', () => {
    const line = '- foo {bar}';
    const selection = { startColumn: 5, endColumn: 9 };
    expect(isSelectionWithinBrackets(line, selection, 'o {b')).toBeTruthy();
  });
});
