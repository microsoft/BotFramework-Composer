// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { renderHook } from '@bfc/test-utils/lib/hooks';

import { useRecognizerConfig } from '../useRecognizerConfig';
import ExtensionContext from '../../extensionContext';

const plugins = {
  uiSchema: {
    foo: {
      form: {},
      menu: {},
    },
    bar: {
      form: {},
      menu: {},
    },
  },
  recognizers: ['recognizer 1', 'recognizer 2'],
};

const wrapper: React.FC = ({ children }) => (
  // @ts-expect-error
  <ExtensionContext.Provider value={{ plugins }}>{children}</ExtensionContext.Provider>
);

describe('useRecognizerConfig', () => {
  it('returns the configured recognizers', () => {
    const { result } = renderHook(() => useRecognizerConfig(), { wrapper });

    expect(result.current).toEqual(['recognizer 1', 'recognizer 2']);
  });
});
