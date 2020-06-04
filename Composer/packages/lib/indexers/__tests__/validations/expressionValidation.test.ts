// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { LgFile } from '@bfc/shared';

import { validate } from '../../src/validations/expressionValidation/validation';

import { searchLgCustomFunction } from './../../src/validations/expressionValidation/index';

describe('search lg custom function', () => {
  it('should return custom functions with namespace', () => {
    const lgFiles = [{ options: ['@strict = false', '@Namespace = foo', '@Exports = bar, cool'], id: 'test.en-us' }];
    const result = searchLgCustomFunction(lgFiles as LgFile[]);
    expect(result.length).toEqual(2);
    expect(result[0]).toEqual('foo.bar');
    expect(result[1]).toEqual('foo.cool');
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
    const expression = { value: 'hello', required: false, path: 'test', types: ['string'] };
    const result = validate(expression, []);
    expect(result).toBeNull();
  });

  it('if start with =, but type is not match', () => {
    const expression = { value: '=13', required: false, path: 'test', types: ['string'] };
    const result = validate(expression, []);
    expect(result?.message).toBe('the expression type is not match');
  });

  it('if start with =, and type is match', () => {
    const expression = { value: '=13', required: false, path: 'test', types: ['integer'] };
    const result = validate(expression, []);
    expect(result).toBeNull();
    expression.value = '=true';
    expression.types[0] = 'boolean';
    const result1 = validate(expression, []);
    expect(result1).toBeNull();
  });

  it('use custom functions, but lg file does not export', () => {
    const expression = { value: '=foo.bar()', required: false, path: 'test', types: ['boolean'] };
    const result = validate(expression, []);
    expect(result).not.toBeNull();
  });

  it('use custom functions, and lg file does export', () => {
    const expression = { value: '=foo.bar()', required: false, path: 'test', types: ['boolean'] };
    const result = validate(expression, ['foo.bar']);
    expect(result).toBeNull();
  });
});
