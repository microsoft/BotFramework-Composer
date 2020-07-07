#!/usr/bin/env node
/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as expr from 'adaptive-expressions';

function generateWords(name: string, locale?: string): string[] {
  const words: string[] = [];
  switch (locale) {
    default:
      {
        let current = 'lower';
        let start = 0;
        let i = 0;
        // Skip first character and treat as lower
        while (++i < name.length) {
          let ch = name.charAt(i);
          let split = false;
          const end = i;
          if (ch === ' ' || ch === '_' || ch === '-') {
            split = true;
            while (i + 1 < name.length) {
              ch = name.charAt(i);
              if (ch === ' ' || ch === '_' || ch === '-') {
                ++i;
              } else {
                break;
              }
            }
          }
          if (ch === ch.toLowerCase()) {
            split = split || current === 'upper';
            current = 'lower';
          } else if (ch === ch.toUpperCase()) {
            split = split || current === 'lower';
            current = 'upper';
          }
          // Word is either all same case or initial case is different
          if (split && end - start > 1) {
            words.push(name.substring(start, end).toLowerCase());
            start = i;
          }
        }
        if (start < name.length) {
          words.push(name.substring(start).toLowerCase());
        }
      }

      return words;
  }
}

export function* generatePhrases(
  name?: string,
  locale?: string,
  minLen?: number,
  maxLen?: number
): IterableIterator<string> {
  if (name) {
    const words = generateWords(name, locale);
    minLen = minLen || 1;
    maxLen = maxLen || words.length;
    for (let len = minLen; len <= maxLen; ++len) {
      for (let start = 0; start <= words.length - len; ++start) {
        yield words.slice(start, start + len).join(' ');
      }
    }
  }
}

export const PhraseEvaluator = new expr.ExpressionEvaluator(
  'phrase',
  expr.ExpressionFunctions.apply(
    (args) => {
      const name = args[0];
      const locale = args.length > 1 ? args[1] : 'en-us';
      return generateWords(name, locale).join(' ');
    },
    (val, expr, pos) => {
      let error;
      switch (pos) {
        case 0:
          if (typeof val !== 'string') error = `${expr} does not have a name string.`;
          break;
        case 1:
          if (typeof val !== 'string') error = `${expr} does not have a locale string.`;
      }
      return error;
    }
  ),
  expr.ReturnType.String,
  (e) => expr.ExpressionFunctions.validateOrder(e, [expr.ReturnType.String], expr.ReturnType.String)
);

export const PhrasesEvaluator = new expr.ExpressionEvaluator(
  'phrases',
  expr.ExpressionFunctions.apply(
    (args) => {
      const name = args[0];
      const locale = args.length > 1 ? args[1] : 'en-us';
      const min = args.length > 2 ? args[2] : undefined;
      const max = args.length > 3 ? args[3] : undefined;
      return Array.from(generatePhrases(name, locale, min, max));
    },
    (val, expr, pos) => {
      let error;
      switch (pos) {
        case 0:
          if (typeof val !== 'string') error = `${expr} does not have a name string.`;
          break;
        case 1:
          if (typeof val !== 'string') error = `${expr} does not have a locale string.`;
          break;
        case 2:
          if (typeof val !== 'number') error = `${expr} does not have a numeric minimum number of words.`;
          break;
        case 3:
          if (typeof val !== 'number') error = `${expr} does not have a numeric maximum number of words.`;
      }
      return error;
    }
  ),
  expr.ReturnType.String,
  (e) =>
    expr.ExpressionFunctions.validateOrder(
      e,
      [expr.ReturnType.String, expr.ReturnType.Number, expr.ReturnType.Number],
      expr.ReturnType.String
    )
);
