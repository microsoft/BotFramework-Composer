// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { useMemo } from 'react';
import debounce from 'lodash/debounce';

export const useDebounce: typeof debounce = (fn, options) => {
  return useMemo(() => debounce(fn, options), [fn]);
};
