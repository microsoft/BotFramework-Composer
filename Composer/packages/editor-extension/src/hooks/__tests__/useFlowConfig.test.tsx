// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { renderHook } from '@bfc/test-utils/lib/hooks';

import { useFlowConfig } from '../useFlowConfig';
import ExtensionContext from '../../extensionContext';

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
  <ExtensionContext.Provider value={{ plugins }}>{children}</ExtensionContext.Provider>
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
