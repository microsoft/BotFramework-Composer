// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { createContext, useContext } from 'react';
import { JSONSchema7 } from '@bfc/extension-client';

interface IAdaptiveFormContext {
  focusedTab?: string;
  baseSchema: JSONSchema7;
  onFocusedTab?: (focusedTab: string) => void;
}

export const AdaptiveFormContext = createContext<IAdaptiveFormContext>({ baseSchema: {} });
export const useAdaptiveFormContext = () => useContext(AdaptiveFormContext);

export default AdaptiveFormContext;
