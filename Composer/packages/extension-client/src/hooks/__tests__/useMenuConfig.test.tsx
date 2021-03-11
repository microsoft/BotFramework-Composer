// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { renderHook } from '@botframework-composer/test-utils/lib/hooks';

import { useMenuConfig } from '../useMenuConfig';
import { EditorExtensionContext } from '../../EditorExtensionContext';

const plugins = {
  uiSchema: {
    foo: {
      form: {},
      menu: { label: 'foo menu config' },
    },
    bar: {
      form: {},
      menu: { label: 'bar menu config' },
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

    expect(result.current.menuSchema).toEqual({
      foo: { label: 'foo menu config' },
      bar: { label: 'bar menu config' },
    });
  });
});
