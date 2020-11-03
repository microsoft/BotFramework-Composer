// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { renderHook } from '@botframework-composer/test-utils/lib/hooks';

import { useFlowConfig } from '../useFlowConfig';
import { EditorExtensionContext } from '../../EditorExtensionContext';

const plugins = {
  uiSchema: {
    foo: {
      menu: {},
      flow: 'foo flow config',
    },
    bar: {
      menu: {},
      flow: 'bar flow config',
    },
  },
};

const wrapper: React.FC = ({ children }) => (
  // @ts-expect-error
  <EditorExtensionContext.Provider value={{ plugins }}>{children}</EditorExtensionContext.Provider>
);

describe('useFlowConfig', () => {
  it('returns a map of sdk kinds to their flow config', () => {
    const { result } = renderHook(() => useFlowConfig(), { wrapper });

    expect(result.current).toEqual({
      foo: 'foo flow config',
      bar: 'bar flow config',
    });
  });
});
