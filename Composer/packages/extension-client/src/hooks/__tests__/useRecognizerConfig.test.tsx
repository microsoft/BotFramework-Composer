// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { renderHook } from '@bfc/test-utils/lib/hooks';

import { useRecognizerConfig } from '../useRecognizerConfig';
import { EditorExtensionContext } from '../../EditorExtensionContext';

const plugins = {
  uiSchema: {
    foo: {
      form: {},
      menu: {},
      recognizer: { displayName: 'recognizer 1' },
    },
    bar: {
      form: {},
      menu: {},
      recognizer: { displayName: 'recognizer 2' },
    },
  },
};

const wrapper: React.FC = ({ children }) => (
  // @ts-expect-error
  <EditorExtensionContext.Provider value={{ plugins }}>{children}</EditorExtensionContext.Provider>
);

describe('useRecognizerConfig', () => {
  it('returns the configured recognizers', () => {
    const { result } = renderHook(() => useRecognizerConfig(), { wrapper });

    expect(result.current.recognizers).toEqual([
      {
        id: 'foo',
        displayName: 'recognizer 1',
      },
      {
        id: 'bar',
        displayName: 'recognizer 2',
      },
    ]);
  });
});
