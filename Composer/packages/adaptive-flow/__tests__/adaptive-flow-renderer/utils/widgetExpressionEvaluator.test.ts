// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  evaluateWidgetProp,
  ActionContextKey,
} from '../../../src/adaptive-flow-renderer/utils/expression/widgetExpressionEvaluator';

const evaluate = evaluateWidgetProp;
describe('evaluateWidgetProp()', () => {
  it('can evaluate string interpolation pattern.', () => {
    expect(evaluate('${a}, ${b}', { a: 1, b: 2 })).toEqual('1, 2');
  });

  it('return origin input when input non-expression string.', () => {
    ['hello', 'action.x', '= Result Value', '= ActivityId'].forEach((x) => {
      expect(evaluate(x, {}, ActionContextKey)).toEqual(x);
    });
  });

  it('can evaluate basic value access pattern.', () => {
    expect(evaluate('=action.x', { action: { x: 1 } })).toEqual(1);

    // Notes: Expression engine behavior. 'null' will be read as 'undefined'
    expect(evaluate('=action.x', { action: { x: null } })).toEqual(undefined);
    expect(evaluate('=action.x', { action: {} })).toEqual(undefined);
    expect(evaluate('=action.x', { action: { x: undefined } })).toEqual(undefined);
    expect(evaluate('=action.x', { action: { x: false } })).toEqual(false);

    // Convert to string
    expect(evaluate('=string(action.x)', { action: { x: null } })).toEqual(undefined);
    expect(evaluate('=string(action.x)', { action: { x: undefined } })).toEqual(undefined);
    expect(evaluate('=string(action.x)', { action: { x: false } })).toEqual('false');

    // Case-insensitive
    expect(evaluate('=action.x', { action: { x: 'x' } })).toEqual('x');
    expect(evaluate('=action.x', { action: { X: 'x' } })).toEqual('x');
  });

  it('can evaluate expressions with foreach', () => {
    expect(evaluate('=foreach(a.items, x=>x)', { a: { items: [] } })).toEqual([]);
    expect(evaluate('=foreach(a.items, x=>x)', { a: { items: [1, 2] } })).toEqual([1, 2]);
    expect(evaluate('=foreach(a.items, x=>x+1)', { a: { items: [1, 2] } })).toEqual([2, 3]);
    expect(evaluate('=foreach(a.items, x=>x)', { a: { items: ['1'] } })).toEqual(['1']);
    expect(evaluate('=foreach(a.items, x=>x+1)', { a: { items: ['1'] } })).toEqual(['11']);
    expect(evaluate('=foreach(a.items, x=>x+"1")', { a: { items: ['1'] } })).toEqual(['11']);
  });

  it('can evaluate expressions with if', () => {
    expect(evaluate('=if(a.x, "1", "2")', { a: { x: true } })).toEqual('1');
    expect(evaluate('=if(a.x, "1", "2")', { a: { X: true } })).toEqual('1');
    expect(evaluate('=if(a.x, "1", "2")', { a: { x: '' } })).toEqual('1');
    expect(evaluate('=if(a.x, "1", "2")', { a: { x: 0 } })).toEqual('1');
    expect(evaluate('=if(a.x<1, "1", "2")', { a: { x: 0 } })).toEqual('1');

    expect(evaluate('=if(a.x, "1", "2")', { a: { x: false } })).toEqual('2');
    expect(evaluate('=if(a.x, "1", "2")', { a: {} })).toEqual('2');
    expect(evaluate('=if(a.x, "1", "2")', { a: { x: null } })).toEqual('2');
    expect(evaluate('=if(a.x, "1", "2")', { a: { x: undefined } })).toEqual('2');
  });

  it('can evaluate string template pattern.', () => {
    expect(evaluate('=concat(a.x, " and ", a.y)', { a: { x: 'x', y: 'y' } })).toEqual('x and y');
    expect(evaluate('=concat(a.x, " and ", a.y)', { a: { X: 'X', Y: 'Y' } })).toEqual('X and Y');
    expect(evaluate('=concat(a.x, " and ", a.y)', { a: { x: 1 } })).toEqual('1 and ');
    expect(evaluate('=concat(string(a.x), " and ", string(a.y))', { a: { x: { val: 1 }, y: [1] } })).toEqual(
      '{"val":1} and [1]'
    );
  });

  describe('can evaluate real Flow use case', () => {
    it('in Foreach.', () => {
      expect(
        evaluate('=concat("Each value in ", coalesce(action.itemsProperty, "?"))', {
          action: { itemsProperty: 'user.names' },
        })
      ).toEqual('Each value in user.names');
      expect(evaluate('=concat("Each value in ", coalesce(action.itemsProperty, "?"))', { action: {} })).toEqual(
        'Each value in ?'
      );
    });

    it('in SetProperties.', () => {
      expect(
        evaluate('=foreach(action.assignments, x => concat(x.property, " : " ,x.value))', {
          action: {
            assignments: [
              { property: 'a', value: 1 },
              { property: 'b', value: '2' },
            ],
          },
        })
      ).toEqual(['a : 1', 'b : 2']);
    });
  });
});
