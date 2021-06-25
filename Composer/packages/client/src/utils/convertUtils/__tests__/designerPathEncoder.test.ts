// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds } from '@bfc/shared';

import { decodeDesignerPathToArrayPath, encodeArrayPathToDesignerPath } from '../designerPathEncoder';

const dialog = {
  triggers: [
    {
      $kind: SDKKinds.OnIntent,
      $designer: { id: '1234' },
      actions: [
        {
          $kind: SDKKinds.SendActivity,
          $designer: { id: '5678' },
        },
        {
          $kind: SDKKinds.SendActivity,
        },
      ],
    },
  ],
};

describe('encodeArrayPathToDesignerPath()', () => {
  it('can handle empty input.', () => {
    expect(encodeArrayPathToDesignerPath(dialog, '')).toEqual('');
    expect(encodeArrayPathToDesignerPath(undefined, '')).toEqual('');
  });

  it('should transform valid array path.', () => {
    expect(encodeArrayPathToDesignerPath(dialog, 'triggers[0].actions[0]')).toEqual(`triggers["1234"].actions["5678"]`);
  });

  it('can handle subdata without $designer.id.', () => {
    expect(encodeArrayPathToDesignerPath(dialog, 'triggers[0].actions[1]')).toEqual(`triggers["1234"].actions[1]`);
  });

  it('can recover from invalid array path.', () => {
    expect(encodeArrayPathToDesignerPath(dialog, 'triggers[0].actions[99]')).toEqual('triggers[0].actions[99]');
  });
});

describe('decodeDesignerPathToArrayPath()', () => {
  it('should transform valid designer path.', () => {
    expect(decodeDesignerPathToArrayPath(dialog, `triggers["1234"].actions["5678"]`)).toEqual('triggers[0].actions[0]');
  });

  it('should transform array index path.', () => {
    expect(decodeDesignerPathToArrayPath(dialog, `triggers[0].actions[0]`)).toEqual('triggers[0].actions[0]');
    expect(decodeDesignerPathToArrayPath(dialog, `triggers[1].actions[1]`)).toEqual('triggers[1].actions[1]');
  });

  it('should transform path in mixed format.', () => {
    expect(decodeDesignerPathToArrayPath(dialog, `triggers[0].actions["5678"]`)).toEqual(`triggers[0].actions[0]`);
    expect(decodeDesignerPathToArrayPath(dialog, `triggers["1234"].actions[1]`)).toEqual(`triggers[0].actions[1]`);
  });

  it('can handle invalid designer path.', () => {
    expect(decodeDesignerPathToArrayPath(dialog, `triggers["1234"].actions["9999"]`)).toEqual(
      `triggers["1234"].actions["9999"]`
    );
    expect(decodeDesignerPathToArrayPath(dialog, `triggers["5678"].actions["1234"]`)).toEqual(
      `triggers["5678"].actions["1234"]`
    );
    expect(decodeDesignerPathToArrayPath(dialog, `dialogs["1234"].actions["5678"]`)).toEqual(
      `dialogs["1234"].actions["5678"]`
    );
  });

  it('can handle empty input.', () => {
    expect(decodeDesignerPathToArrayPath(dialog, '')).toEqual('');
    expect(decodeDesignerPathToArrayPath(undefined, '')).toEqual('');
  });
});
