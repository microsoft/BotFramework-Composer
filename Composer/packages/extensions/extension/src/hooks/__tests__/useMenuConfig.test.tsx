// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { renderHook } from '@bfc/test-utils/lib/hooks';

import { useMenuConfig } from '../useMenuConfig';
import ExtensionContext from '../../extensionContext';

const plugins = {
  uiSchema: {
    foo: {
      form: {},
      menu: 'foo menu config',
    },
    bar: {
      form: {},
      menu: 'bar menu config',
    },
  },
};

const wrapper: React.FC = ({ children }) => (
  // @ts-expect-error
  <ExtensionContext.Provider value={{ plugins }}>{children}</ExtensionContext.Provider>
);

describe('useMenuConfig', () => {
  it('returns a map of sdk kinds to their menu config', () => {
    const { result } = renderHook(() => useMenuConfig(), { wrapper });

    expect(result.current).toEqual({
      foo: 'foo menu config',
      bar: 'bar menu config',
    });
  });
});
