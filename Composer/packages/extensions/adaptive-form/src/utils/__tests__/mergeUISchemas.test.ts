// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { UISchema } from '@bfc/extension';
import { SDKTypes } from '@bfc/shared';

import { mergeUISchema } from '../mergeUISchema';
import DefaultUISchema from '../../defaultUiSchema';

describe('mergeUISchema', () => {
  it('returns default ui schema when no overrides', () => {
    expect(mergeUISchema()).toEqual(DefaultUISchema);
  });

  it('merges overrides into the defaults', () => {
    const overrides: UISchema = {
      [SDKTypes.AdaptiveDialog]: {
        'ui:hidden': ['recognizer'],
        properties: {
          triggers: {
            'ui:label': 'Foo',
          },
        },
      },
    };

    const merged = mergeUISchema(overrides)[SDKTypes.AdaptiveDialog];
    expect(merged?.['ui:hidden']).toEqual(['recognizer']);

    expect(merged?.properties?.triggers).toEqual({
      'ui:label': 'Foo',
    });

    expect(merged?.['ui:order']).toMatchInlineSnapshot(`
Array [
  "recognizer",
  "*",
]
`);
  });
});
