// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { createSingleMessage, combineMessage, findErrors, isValid } from '../../src/utils/diagnosticUtil';

const diagnostics = [
  {
    message: 'syntax error',
    range: { start: { line: 15, character: 0 }, end: { line: 15, character: 1 } },
    severity: 0,
    source: 'a.lu',
  },
  {
    message: 'syntax error',
    range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } },
    severity: 0,
    source: 'b.lu',
  },
  {
    message: 'syntax error',
    range: { start: { line: 1, character: 0 }, end: { line: 1, character: 1 } },
    severity: 0,
    source: 'c.lu',
  },
  {
    message: 'file empty',
    range: { start: { line: 2, character: 0 }, end: { line: 2, character: 1 } },
    severity: 1,
    source: 'd.lu',
  },
];

const diagnostics1 = [
  {
    message: 'file empty',
    range: { start: { line: 2, character: 0 }, end: { line: 2, character: 1 } },
    severity: 1,
    source: 'd.lu',
  },
];

describe('diagnostic utils', () => {
  it('should check if the diagnostics have errors', () => {
    expect(isValid(diagnostics)).toBe(false);
    expect(isValid(diagnostics1)).toBe(true);
  });
  it('should find all errors', () => {
    expect(findErrors(diagnostics).length).toBe(3);
    expect(findErrors(diagnostics1).length).toBe(0);
  });
  it('should create a message for single diagnostic', () => {
    expect(createSingleMessage(diagnostics[0])).toContain('line 15:0 - line 15:1');
    expect(createSingleMessage(diagnostics[1])).toContain('line 0:0 - line 0:1');
  });
  it('should combine all error message', () => {
    const result = combineMessage(diagnostics);
    expect(result).toContain('line 15:0 - line 15:1');
    expect(result).toContain('line 0:0 - line 0:1');
    expect(result).toContain('line 1:0 - line 1:1');
    expect(result).toContain('line 2:0 - line 2:1');
  });
});
