// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { renderHook } from '@botframework-composer/test-utils/lib/hooks';

import { useRecognizerConfig } from '../useRecognizerConfig';
import { EditorExtensionContext } from '../../EditorExtensionContext';

const shellData = {
  currentDialog: { content: {} },
  schemas: { sdk: { content: { definitions: { foo: 'foo schema', bar: 'bar schema' } } } },
};
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
    notInAppSchema: {
      form: {},
      menu: {},
      recognizer: { displayName: 'not in app schema' },
    },
  },
};

const wrapper: React.FC = ({ children }) => (
  // @ts-expect-error
  <EditorExtensionContext.Provider value={{ plugins, shellData }}>{children}</EditorExtensionContext.Provider>
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

  it("omits recognizer config that isn't in the schema", () => {
    const { result } = renderHook(() => useRecognizerConfig(), { wrapper });
    expect(Object.keys(result.current.recognizers)).not.toContain('notInAppSchema');
  });
});
