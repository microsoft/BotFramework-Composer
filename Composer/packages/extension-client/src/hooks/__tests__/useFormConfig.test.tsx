// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { renderHook } from '@botframework-composer/test-utils/lib/hooks';

import { useFormConfig } from '../useFormConfig';
import { EditorExtensionContext } from '../../EditorExtensionContext';

const plugins = {
  uiSchema: {
    foo: {
      menu: {},
      form: 'foo form config',
    },
    bar: {
      menu: {},
      form: 'bar form config',
    },
  },
};

const wrapper: React.FC = ({ children }) => (
  // @ts-expect-error
  <EditorExtensionContext.Provider value={{ plugins }}>{children}</EditorExtensionContext.Provider>
);

describe('useFormConfig', () => {
  it('returns a map of sdk kinds to their form config', () => {
    const { result } = renderHook(() => useFormConfig(), { wrapper });

    expect(result.current).toEqual({
      foo: 'foo form config',
      bar: 'bar form config',
    });
  });
});
