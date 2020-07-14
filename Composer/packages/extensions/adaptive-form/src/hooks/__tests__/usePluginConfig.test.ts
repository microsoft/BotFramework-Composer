// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { renderHook } from '@bfc/test-utils/lib/hooks';

import { usePluginConfig } from '../usePluginConfig';

describe('usePluginConfig', () => {
  it('returns the plugin context', () => {
    const { result } = renderHook(() => usePluginConfig());

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
