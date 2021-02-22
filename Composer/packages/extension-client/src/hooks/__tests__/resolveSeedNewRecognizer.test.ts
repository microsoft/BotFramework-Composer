// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { resolveSeedNewRecognizer } from '../resolveSeedNewRecognizer';

describe('resolveSeedNewRecognizer()', () => {
  it('can generate correct seed function.', () => {
    const seedNewRecognizer = resolveSeedNewRecognizer('Microsoft.CustomRecognizer', {
      fields: {
        field1: '${userName}',
        field2: 'hello',
        field3: '${dialogId}.lu',
      },
    } as any);

    expect(seedNewRecognizer).toBeTruthy();

    if (!seedNewRecognizer) return;
    expect(
      seedNewRecognizer(
        {
          userName: 'test',
          dialogId: 'dialog1',
        } as any,
        {} as any
      )
    ).toEqual({
      $kind: 'Microsoft.CustomRecognizer',
      field1: 'test',
      field2: 'hello',
      field3: 'dialog1.lu',
    });
  });
});
