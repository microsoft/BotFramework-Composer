// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { hooks } from '@bfc/test-utils';

import { usePluginConfig } from '../usePluginConfig';

describe('usePluginConfig', () => {
  it('returns the plugin context', () => {
    const { result } = hooks.renderHook(() => usePluginConfig());

    expect(result.current).toMatchInlineSnapshot(`
      Object {
        "formSchema": Object {},
        "recognizers": Array [],
        "roleSchema": Object {},
        "visualSchema": Object {},
      }
    `);
  });
});
