// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LuFile } from '@botframework-composer/types';
import styled from '@emotion/styled';
import { FluentTheme, NeutralColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import {
  IContextualMenuItem,
  IContextualMenuItemProps,
  IContextualMenuProps,
} from 'office-ui-fabric-react/lib/ContextualMenu';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import * as React from 'react';

import { useNoSearchResultMenuItem } from '../../hooks/useNoSearchResultMenuItem';
import { useSearchableMenuListCallback } from '../../hooks/useSearchableMenuListCallback';
import { getEntityTypeDisplayName } from '../../utils/luUtils';
import { ToolbarLuEntityType } from '../types';

import { useLuEntities } from './useLuEntities';

const headerContainerStyles = {
  root: { height: 32 },
};

const fontSizeStyle = {
  fontSize: FluentTheme.fonts.small.fontSize,
};

const Header = styled(Label)({
  padding: '0 8px',
  color: FluentTheme.palette.accent,
  ...fontSizeStyle,
});

const itemContainerTokens = { childrenGap: 8 };

const primaryTextStyles = { root: { flex: 1, whiteSpace: 'nowrap', overflowX: 'hidden', textOverflow: 'ellipsis' } };
const secondaryTextStyles = { root: { color: NeutralColors.gray90 } };

/**
 * Provides labeling menu props for LU labeling.
 * @param nonMlEntityMode Allows for filtering non-ml entities, or disabling them.
 * @param luFile Current dialogs lu file.
 * @param onItemClick Callback for selecting an item from entity list.
 * @param onlyMlEntities Allows caller to filter out prebuilt entities.
 * @returns Returns menuProps for labeling menu and if labeling is not possible and should be disabled.
 */
export const useLabelingMenuProps = (
  nonMlEntityMode: 'disable' | 'filter' | 'none',
  luFile?: LuFile,
  onItemClick?: IContextualMenuItem['onClick'],
  options: Partial<{ menuHeaderText: string }> = {}
): { menuProps: IContextualMenuProps; noEntities: boolean } => {
  const filterPredicate = React.useMemo(
    () => (e) => e.Type === 'ml' || (nonMlEntityMode !== 'filter' && e.Type === 'prebuilt'),
    [nonMlEntityMode]
  );
  const { menuHeaderText } = options;
  const entities = useLuEntities(luFile, filterPredicate);

  const searchHeaderRenderer = React.useCallback(
    () => (
      <Stack styles={headerContainerStyles} verticalAlign="center">
        <Header>{menuHeaderText || formatMessage('Insert defined entity')}</Header>
      </Stack>
    ),
    [menuHeaderText]
  );

  const { onRenderMenuList, query, setQuery } = useSearchableMenuListCallback(
    formatMessage('Search entities'),
    searchHeaderRenderer
  );

  const noSearchResultsMenuItem = useNoSearchResultMenuItem(formatMessage('no entities found'));

  const items = React.useMemo<IContextualMenuItem[]>(() => {
    const filteredEntities = query
      ? entities.filter((e) => e.Name.toLowerCase().indexOf(query.toLowerCase()) !== -1)
      : entities;
    if (!filteredEntities.length) {
      return [noSearchResultsMenuItem];
    }

    return filteredEntities.map<IContextualMenuItem>((e) => ({
      key: `${e.Type}-${e.Name}`,
      disabled: nonMlEntityMode === 'disable' && (e.Type as ToolbarLuEntityType) !== 'ml',
      text: e.Name,
      secondaryText: getEntityTypeDisplayName(e.Type as ToolbarLuEntityType),
      data: e,
      onClick: onItemClick,
    }));
  }, [nonMlEntityMode, entities, query, noSearchResultsMenuItem, onItemClick]);

  const contextualMenuItemAs = React.useCallback((itemProps: IContextualMenuItemProps) => {
    return (
      <Stack horizontal tokens={itemContainerTokens}>
        <Text styles={primaryTextStyles} title={itemProps.item.text} variant="small">
          {itemProps.item.text}
        </Text>
        <Text styles={secondaryTextStyles} title={itemProps.item.secondaryText} variant="small">
          {itemProps.item.secondaryText}
        </Text>
      </Stack>
    );
  }, []);

  const onDismiss = React.useCallback(() => {
    setQuery('');
  }, []);

  return {
    noEntities: !entities.length,
    menuProps: { items, onRenderMenuList, contextualMenuItemAs, onDismiss },
  };
};
