// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ExtractResources } from './../../src/dialogUtils/extractResources';

describe('extract resources in dialog', () => {
  it('should find out lg templates in actions', () => {
    const dialog1 = {
      $kind: 'Microsoft.SendActivity',
      $designer: {
        id: '157674',
        name: 'Send a response',
      },
      activity: '${bfdactivity-157674()}',
    };

    const resources = ExtractResources(dialog1);

    expect(resources.lgTemplates.length).toEqual(1);
    expect(resources.luIntents.length).toEqual(0);
    expect(resources.lgTemplates).toEqual([
      {
        name: 'bfdactivity-157674',
        path: '$',
      },
    ]);
  });

  it('should find out lu intents in triggers', () => {
    const dialog1 = {
      $kind: 'Microsoft.OnIntent',
      $designer: {
        id: 'X-Xce_',
      },
      intent: 'FooIntent',
    };

    const resources = ExtractResources(dialog1);

    expect(resources.lgTemplates.length).toEqual(0);
    expect(resources.luIntents.length).toEqual(1);
    expect(resources.luIntents).toEqual([
      {
        name: 'FooIntent',
        path: '$#Microsoft.OnIntent',
      },
    ]);
  });
});
