// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useState, useCallback } from 'react';

import { useDebounce } from './useDebounce';

/**
 * Debounced query and callbacks for FluentUI SearchBox.
 */
export const useDebouncedSearchCallbacks = () => {
  const [query, setQuery] = useState<string | undefined>();
  const debouncedQuery = useDebounce<string | undefined>(query, 300);

  const onSearchAbort = useCallback(() => {
    setQuery('');
  }, []);

  const onSearchQueryChange = useCallback((_?: React.ChangeEvent<HTMLInputElement>, newValue?: string) => {
    setQuery(newValue);
  }, []);

  return { onSearchAbort, onSearchQueryChange, query: debouncedQuery, setQuery };
};
