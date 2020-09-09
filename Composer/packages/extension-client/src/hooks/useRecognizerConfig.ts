// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext } from 'react';

import { EditorExtensionContext } from '../EditorExtensionContext';

export function useRecognizerConfig() {
  const { plugins } = useContext(EditorExtensionContext);

  return plugins.recognizers ?? [];
}
