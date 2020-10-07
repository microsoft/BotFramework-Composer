// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { renderHook } from '@bfc/test-utils/lib/hooks';

import { useMenuConfig } from '../useMenuConfig';
import { EditorExtensionContext } from '../../EditorExtensionContext';

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

const shellData = {
  schemas: {
    sdk: {
      content: {
        definitions: {
          foo: 'foo',
          bar: 'bar',
        },
      },
    },
  },
};

const wrapper: React.FC = ({ children }) => (
  // @ts-expect-error
  <EditorExtensionContext.Provider value={{ plugins, shellData }}>{children}</EditorExtensionContext.Provider>
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
