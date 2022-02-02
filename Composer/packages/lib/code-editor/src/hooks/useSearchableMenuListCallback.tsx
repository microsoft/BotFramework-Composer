// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FluentTheme } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { IContextualMenuListProps } from 'office-ui-fabric-react/lib/ContextualMenu';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { IRenderFunction } from 'office-ui-fabric-react/lib/Utilities';
import * as React from 'react';

import { useDebouncedSearchCallbacks } from './useDebouncedSearchCallbacks';

const fontSizeStyle = {
  fontSize: FluentTheme.fonts.small.fontSize,
};

const searchFieldStyles = { root: { borderRadius: 0, ...fontSizeStyle }, iconContainer: { display: 'none' } };

/**
 * Callback for FluentUI contextual menu list renderer with search box on top.
 */
export const useSearchableMenuListCallback = (
  searchFiledPlaceHolder?: string,
  headerRenderer?: () => React.ReactNode
) => {
  const { onSearchAbort, onSearchQueryChange, query, setQuery } = useDebouncedSearchCallbacks();

  const onReset = React.useCallback(() => {
    setQuery('');
  }, [setQuery]);

  const callback = React.useCallback(
    (menuListProps?: IContextualMenuListProps, defaultRender?: IRenderFunction<IContextualMenuListProps>) => {
      return (
        <Stack>
          {headerRenderer?.()}
          <SearchBox
            disableAnimation
            placeholder={searchFiledPlaceHolder ?? formatMessage('Search ...')}
            styles={searchFieldStyles}
            onAbort={onSearchAbort}
            onChange={onSearchQueryChange}
          />
          {defaultRender?.(menuListProps)}
        </Stack>
      );
    },
    [searchFiledPlaceHolder, headerRenderer, onReset, onSearchQueryChange]
  );

  return { onRenderMenuList: callback, query, onReset };
};
