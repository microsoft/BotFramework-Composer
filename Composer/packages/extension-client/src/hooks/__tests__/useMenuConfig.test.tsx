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
          'Microsoft.TestAction': {
            $role: 'implements(Microsoft.IDialog)',
            title: 'Test Action',
          },
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

    expect(result.current.menuSchema).toEqual(
      expect.objectContaining({
        foo: { label: 'foo menu config' },
        bar: { label: 'bar menu config' },
      })
    );
  });
  it('menuSchema includes sdk actions that are missing ui schema', () => {
    const { result } = renderHook(() => useMenuConfig(), { wrapper });

    expect(result.current.menuSchema).toEqual(
      expect.objectContaining({
        'Microsoft.TestAction': { label: 'Test Action', submenu: ['Other'] },
      })
    );
  });
});
