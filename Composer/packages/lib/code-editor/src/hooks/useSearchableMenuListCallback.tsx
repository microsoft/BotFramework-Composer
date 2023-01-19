// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FluentTheme } from '@fluentui/theme';
import formatMessage from 'format-message';
import { IContextualMenuListProps } from '@fluentui/react/lib/ContextualMenu';
import { SearchBox } from '@fluentui/react/lib/SearchBox';
import { Stack } from '@fluentui/react/lib/Stack';
import { IRenderFunction } from '@fluentui/react/lib/Utilities';
import * as React from 'react';
import { Announced } from '@fluentui/react/lib/Announced';

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

  const searchComplete = !!query;

  const callback = React.useCallback(
    (menuListProps?: IContextualMenuListProps, defaultRender?: IRenderFunction<IContextualMenuListProps>) => {
      const searchCompleteAnnouncement = searchComplete
        ? formatMessage(
            `Search for the {query}. Found {count, plural,
              =1 {one result}
              other {# results}
            }`,
            { query, count: menuListProps?.items?.filter((item) => item?.key && item.key !== 'no_results').length }
          )
        : undefined;

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
          <Announced message={searchCompleteAnnouncement} role="alert" />
          {defaultRender?.(menuListProps)}
        </Stack>
      );
    },
    [searchFiledPlaceHolder, headerRenderer, onReset, onSearchQueryChange, searchComplete]
  );

  return { onRenderMenuList: callback, query, onReset };
};
