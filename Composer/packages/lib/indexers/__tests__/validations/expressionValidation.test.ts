// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { LgFile } from '@bfc/shared';
import { ReturnType } from 'adaptive-expressions';

import { checkExpression, filterCustomFunctionError } from '../../src/validations/expressionValidation/validation';

import { searchLgCustomFunction } from './../../src/validations/expressionValidation/index';

describe('search lg custom function', () => {
  it('should return custom functions with namespace', () => {
    const lgFiles = [{ options: ['@strict = false', '@Namespace = foo', '@Exports = bar, cool'], id: 'test.en-us' }];
    const result = searchLgCustomFunction(lgFiles as LgFile[]);
    expect(result.length).toEqual(2);
    expect(result[0]).toEqual('foo.bar');
    expect(result[1]).toEqual('foo.cool');
    const lgFilesWithoutOptions = [{ id: 'test.en-us' }];
    const result1 = searchLgCustomFunction(lgFilesWithoutOptions as LgFile[]);
    expect(result1.length).toEqual(0);
  });

  it('should return custom functions with namespace', () => {
    const lgFiles = [{ options: ['@strict = false', '@Exports = bar, cool'], id: 'test.en-us' }];
    const result = searchLgCustomFunction(lgFiles as LgFile[]);
    expect(result.length).toEqual(2);
    expect(result[0]).toEqual('test.en-us.bar');
    expect(result[1]).toEqual('test.en-us.cool');
  });
});

describe('validate expression', () => {
  it('if string expression do nothing', () => {
    const result = checkExpression('hello', true, [ReturnType.String]);
    expect(result).toBe(ReturnType.String);
  });

  it('if start with =, but type is not match', () => {
    const result = checkExpression('=13', true, [ReturnType.String]);
    expect(result).toBe(ReturnType.Number);
  });

  it('if start with =, and type is match', () => {
    const result = checkExpression('=13', true, [ReturnType.Number]);
    expect(result).toBe(ReturnType.Number);
    const result1 = checkExpression('=true', true, [ReturnType.Boolean]);
    expect(result1).toBe(ReturnType.Boolean);
  });

  it('use custom functions will not throw error', () => {
    try {
      checkExpression('=foo.bar()', true, [ReturnType.Boolean]);
    } catch (error) {
      expect(error.message).toBe(
        "foo.bar does not have an evaluator, it's not a built-in function or a custom function."
      );
    }
  });

  it('use custom functions, and lg file does export', () => {
    try {
      checkExpression('=foo.bar()', true, [ReturnType.Boolean]);
    } catch (error) {
      const message = filterCustomFunctionError(error.message, ['foo.bar']);
      expect(message).toBe('');
    }
  });

  it('built-in function return type', () => {
    const result = checkExpression("=concat('test', '1')", true, [ReturnType.String]);
    expect(result).toBe(24);
  });
});
