// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import formatMessage from 'format-message';
import React, { useMemo, useCallback, useEffect, useRef, FocusEvent, KeyboardEvent, useState, FormEvent } from 'react';
import { TextField, ITextField, ITextFieldStyles } from 'office-ui-fabric-react/lib/TextField';
import debounce from 'lodash/debounce';
import { IContextualMenuItem, ContextualMenu, DirectionalHint } from 'office-ui-fabric-react/lib/ContextualMenu';
import { FontSizes, SharedColors } from '@uifabric/fluent-theme';
import { useRecoilValue } from 'recoil';

import { getDefaultFontSettings } from '../../../../recoilModel/utils/fontUtil';
import { currentProjectIdState, dispatcherState, watchedVariablesState } from '../../../../recoilModel';

import { PropertyItem } from './utils/components/PropertyTreeItem';
import { useNoSearchResultMenuItem } from './utils/hooks/useNoSearchResultMenuItem';
import { computePropertyItemTree, getAllNodes, WatchDataPayload } from './utils/helpers';
import { getPickerContextualMenuItem } from './utils/components/PickerContextualMenuItem';

const DEFAULT_FONT_SETTINGS = getDefaultFontSettings();

type WatchVariablePickerProps = {
  path: string;
  payload: WatchDataPayload;
  disabled?: boolean;
  variableId: string;
};

const getStrings = () => {
  return {
    emptyMessage: formatMessage('No properties found'),
    searchPlaceholder: formatMessage('Add property path to watch'),
  };
};

const textFieldStyles = (errorMessage?: string): Partial<ITextFieldStyles> => ({
  field: {
    fontFamily: DEFAULT_FONT_SETTINGS.fontFamily,
    fontSize: FontSizes.size12,
  },
  fieldGroup: {
    backgroundColor: 'transparent',
    height: 16,
  },
  root: {
    selectors: {
      '.ms-TextField-fieldGroup': {
        border: 'none',
        outline: errorMessage ? `2px solid ${SharedColors.red20}` : 'none',
      },
    },
  },
});

const pickerContainer = css`
  margin: '0';
  width: '240px';
`;

export const WatchVariablePicker = React.memo((props: WatchVariablePickerProps) => {
  const currentProjectId = useRecoilValue(currentProjectIdState);
  const watchedVariables = useRecoilValue(watchedVariablesState(currentProjectId));
  const { setWatchedVariables } = useRecoilValue(dispatcherState);
  const { path, payload, variableId } = props;
  const [errorMessage, setErrorMessage] = useState('');
  const [query, setQuery] = useState<string | null>(null);
  const inputBoxElementRef = useRef<ITextField | null>(null);
  const pickerContainerElementRef = useRef<null | HTMLDivElement>(null);
  const [showContextualMenu, setShowContextualMenu] = React.useState(false);
  const [items, setItems] = useState<IContextualMenuItem[]>([]);
  const [propertyTreeExpanded, setPropertyTreeExpanded] = React.useState<Record<string, boolean>>({});
  const uiStrings = useMemo(() => getStrings(), []);

  const noSearchResultMenuItem = useNoSearchResultMenuItem(uiStrings.emptyMessage);

  const propertyTreeConfig = useMemo(() => {
    const { properties } = payload.data;
    return { root: computePropertyItemTree(properties) };
  }, [payload]);

  const onHideContextualMenu = () => {
    setShowContextualMenu(false);
  };

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
          setErrorMessage('');
          setWatchedVariables(currentProjectId, { ...watchedVariables, [variableId]: path });
          onHideContextualMenu();
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
        setErrorMessage('');
        setWatchedVariables(currentProjectId, { ...watchedVariables, [variableId]: path });
        onHideContextualMenu();
      },
      data: {
        node,
        path: paths[node.id],
        level: 0,
      },
    })) as IContextualMenuItem[];
  }, [currentProjectId, onHideContextualMenu, payload, propertyTreeConfig, variableId, watchedVariables]);

  const getFilterPredicate = useCallback((q: string) => {
    return (item: IContextualMenuItem) =>
      item.data.node.children.length === 0 && item.secondaryText?.toLowerCase().indexOf(q.toLowerCase()) !== -1;
  }, []);

  const menuItems = useMemo(getContextualMenuItems, [payload, propertyTreeExpanded]);

  useEffect(() => setItems(menuItems), [menuItems]);

  const performDebouncedSearch = useMemo(
    () =>
      debounce((passedQuery?: string) => {
        if (passedQuery) {
          const predicate = getFilterPredicate(passedQuery);

          const filteredItems = flatPropertyListItems.filter(predicate);

          if (!filteredItems || !filteredItems.length) {
            filteredItems.push(noSearchResultMenuItem);
          }

          setItems(filteredItems);
        } else {
          setItems(menuItems);
        }
      }, 500),
    [getFilterPredicate, menuItems]
  );

  const onInputChange = useCallback(
    (_e: FormEvent<HTMLInputElement | HTMLTextAreaElement>, val: string | undefined) => {
      setQuery(val ?? '');
      performDebouncedSearch(val);
    },
    [performDebouncedSearch]
  );

  const onTextBoxFocus = (event: FocusEvent<HTMLInputElement>) => {
    onShowContextualMenu(event);
  };

  const onTextBoxKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (query && event.key === 'Enter') {
        event.preventDefault();
        if (Object.values(watchedVariables).find((variable) => variable === query)) {
          // variable is already being watched
          setErrorMessage(formatMessage('You are already watching this property.'));
        } else {
          // watch the variable
          setErrorMessage('');
          setWatchedVariables(currentProjectId, { ...watchedVariables, [variableId]: query });
          onHideContextualMenu();
          inputBoxElementRef.current?.blur();
        }
      }
    },
    [currentProjectId, onHideContextualMenu, variableId, query, watchedVariables]
  );

  const onDismiss = useCallback(() => {
    setPropertyTreeExpanded({});
    onHideContextualMenu();
  }, [onHideContextualMenu]);

  const contextualMenuItemRenderer = useMemo(() => {
    return getPickerContextualMenuItem(query ?? '', propertyTreeExpanded);
  }, [query, propertyTreeExpanded]);

  return (
    <div ref={pickerContainerElementRef} css={pickerContainer}>
      <TextField
        componentRef={inputBoxElementRef}
        errorMessage={errorMessage}
        id={variableId}
        placeholder={uiStrings.searchPlaceholder}
        styles={textFieldStyles(errorMessage)}
        value={query ?? path}
        onChange={onInputChange}
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
        target={pickerContainerElementRef.current}
        onDismiss={onDismiss}
        onItemClick={onHideContextualMenu}
      />
    </div>
  );
});
