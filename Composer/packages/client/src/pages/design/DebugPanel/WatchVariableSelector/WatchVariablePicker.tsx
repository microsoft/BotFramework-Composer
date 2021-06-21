// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import formatMessage from 'format-message';
import React, { useMemo, useCallback, useEffect, useRef, FocusEvent, KeyboardEvent, useState, FormEvent } from 'react';
import { TextField, ITextField, ITextFieldStyles } from 'office-ui-fabric-react/lib/TextField';
import debounce from 'lodash/debounce';
import { IContextualMenuItem, ContextualMenu, DirectionalHint } from 'office-ui-fabric-react/lib/ContextualMenu';
import { SharedColors } from '@uifabric/fluent-theme';

import { getDefaultFontSettings } from '../../../../recoilModel/utils/fontUtil';

import { PropertyItem } from './utils/components/PropertyTreeItem';
import { useNoSearchResultMenuItem } from './utils/hooks/useNoSearchResultMenuItem';
import { computePropertyItemTree, getAllNodes, WatchDataPayload } from './utils/helpers';
import { GetPickerContextualMenuItem } from './utils/components/PickerContextualMenuItem';

const DEFAULT_FONT_SETTINGS = getDefaultFontSettings();

type WatchVariablePickerProps = {
  payload: WatchDataPayload;
  disabled?: boolean;
  errorMessage?: string;
  variableId: string;
  path: string;
  onSelectPath: (id: string, selectedPath: string) => void;
};

const getStrings = () => {
  return {
    emptyMessage: formatMessage('No properties found'),
    searchPlaceholder: formatMessage('Add a property'),
  };
};

const textFieldStyles: Partial<ITextFieldStyles> = {
  field: {
    fontFamily: DEFAULT_FONT_SETTINGS.fontFamily,
    fontSize: 12,
  },
  fieldGroup: {
    backgroundColor: 'transparent',
    height: 16,
  },
  root: {
    selectors: {
      '.ms-TextField-fieldGroup': {
        border: 'none',
      },
    },
  },
};

const pickerContainer = css`
  margin: '0';
  width: '240px';
`;

const redErrorMessage = css`
  color: ${SharedColors.red20};
`;

export const WatchVariablePicker = React.memo((props: WatchVariablePickerProps) => {
  const { errorMessage, payload, variableId, path, onSelectPath } = props;
  const [query, setQuery] = useState(path);
  const inputBoxElement = useRef<ITextField | null>(null);
  const pickerContainerElement = useRef<null | HTMLDivElement>(null);
  const [showContextualMenu, setShowContextualMenu] = React.useState(false);
  const [items, setItems] = useState<IContextualMenuItem[]>([]);
  const [propertyTreeExpanded, setPropertyTreeExpanded] = React.useState<Record<string, boolean>>({});
  const uiStrings = useMemo(() => getStrings(), []);

  useEffect(() => {
    setQuery(path);
  }, [path]);

  const noSearchResultMenuItem = useNoSearchResultMenuItem(uiStrings.emptyMessage);

  const propertyTreeConfig = useMemo(() => {
    const { properties } = (payload as WatchDataPayload).data;
    return { root: computePropertyItemTree(properties) };
  }, [payload]);

  const getContextualMenuItems = (): IContextualMenuItem[] => {
    const { root } = propertyTreeConfig;
    const { nodes, levels, paths } = getAllNodes<PropertyItem>(root, {
      expanded: propertyTreeExpanded,
      skipRoot: true,
    });

    const onToggleExpand = (itemId: string, expanded: boolean) => {
      setPropertyTreeExpanded({ ...propertyTreeExpanded, [itemId]: expanded });
    };

    return nodes.map((node) => ({
      key: node.id,
      text: node.name,
      secondaryText: paths[node.id],
      onClick: (event) => {
        if (node.children.length) {
          event?.preventDefault();
          onToggleExpand(node.id, !propertyTreeExpanded[node.id]);
        } else {
          const path = paths[node.id];
          setQuery(path);
          event?.preventDefault();
          onHideContextualMenu();
          onSelectPath(variableId, path);
        }
      },
      data: {
        node,
        path: paths[node.id],
        level: levels[node.id] - 1,
        onToggleExpand,
      },
    }));
  };

  const onShowContextualMenu = (event: FocusEvent<HTMLInputElement>) => {
    event.preventDefault();
    setShowContextualMenu(true);
  };

  const onHideContextualMenu = () => {
    setShowContextualMenu(false);
  };

  const flatPropertyListItems = React.useMemo(() => {
    const { root } = propertyTreeConfig;
    const { nodes, paths } = getAllNodes<PropertyItem>(root, { skipRoot: true });

    return nodes.map((node) => ({
      text: node.id,
      key: node.id,
      secondaryText: paths[node.id],
      onClick: (event) => {
        event?.preventDefault();
        const path = paths[node.id];
        onSelectPath(variableId, path);
        onHideContextualMenu();
      },
      data: {
        node,
        path: paths[node.id],
        level: 0,
      },
    })) as IContextualMenuItem[];
  }, [payload, propertyTreeConfig]);

  const getFilterPredicate = useCallback((q: string) => {
    return (item: IContextualMenuItem) =>
      item.data.node.children.length === 0 && item.secondaryText?.toLowerCase().indexOf(q.toLowerCase()) !== -1;
  }, []);

  const menuItems = useMemo(getContextualMenuItems, [payload, propertyTreeExpanded]);

  useEffect(() => setItems(menuItems), [menuItems]);

  const handleDebouncedSearch: () => void = useCallback(
    debounce(() => {
      if (query) {
        const searchableItems = flatPropertyListItems;

        const predicate = getFilterPredicate(query);

        const filteredItems = searchableItems.filter(predicate);

        if (!filteredItems || !filteredItems.length) {
          filteredItems.push(noSearchResultMenuItem);
        }

        setItems(filteredItems);
      } else {
        setItems(menuItems);
      }
    }, 500),
    [menuItems, flatPropertyListItems, noSearchResultMenuItem, query]
  );

  useEffect(() => {
    handleDebouncedSearch();
  }, [menuItems, flatPropertyListItems, noSearchResultMenuItem, query]);

  const onTextBoxFocus = (event: FocusEvent<HTMLInputElement>) => {
    onShowContextualMenu(event);
  };

  const onTextBoxKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      // enter
      if (event.keyCode == 13) {
        event.preventDefault();
        onSelectPath(variableId, query);
        onHideContextualMenu();
        inputBoxElement.current?.blur();
      }
    },
    [variableId, query]
  );

  const onDismiss = useCallback(() => {
    setPropertyTreeExpanded({});
    onHideContextualMenu();
  }, []);

  const contextualMenuItemRenderer = useMemo(() => {
    return GetPickerContextualMenuItem(query, propertyTreeExpanded);
  }, [query, propertyTreeExpanded]);

  return (
    <div ref={pickerContainerElement} css={pickerContainer}>
      <TextField
        componentRef={inputBoxElement}
        id={variableId}
        placeholder={uiStrings.searchPlaceholder}
        styles={textFieldStyles}
        value={query}
        onChange={(_e: FormEvent<HTMLInputElement | HTMLTextAreaElement>, val: string | undefined) => {
          setQuery(val ?? '');
        }}
        onFocus={onTextBoxFocus}
        onKeyDown={onTextBoxKeyDown}
      />
      <ContextualMenu
        useTargetAsMinWidth
        useTargetWidth
        contextualMenuItemAs={contextualMenuItemRenderer}
        delayUpdateFocusOnHover={false}
        directionalHint={DirectionalHint.bottomLeftEdge}
        hidden={!showContextualMenu}
        items={items}
        shouldFocusOnMount={false}
        styles={{
          root: {
            maxHeight: '200px',
            overflowY: 'auto',
            width: '240px',
          },
        }}
        target={pickerContainerElement}
        onDismiss={onDismiss}
        onItemClick={onHideContextualMenu}
      />
      {errorMessage ? <span css={redErrorMessage}>{errorMessage}</span> : null}
    </div>
  );
});
