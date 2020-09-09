// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useContext } from 'react';

import ExtensionContext from '../extensionContext';

export function useRecognizerConfig() {
  const { plugins } = useContext(ExtensionContext);

  return plugins.recognizers ?? [];
}
