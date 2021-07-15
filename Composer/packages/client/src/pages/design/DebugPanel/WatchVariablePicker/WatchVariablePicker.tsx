// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import formatMessage from 'format-message';
import React, { useMemo, useCallback, useEffect, useRef, FocusEvent, KeyboardEvent, useState, FormEvent } from 'react';
import { TextField, ITextField, ITextFieldStyles } from 'office-ui-fabric-react/lib/TextField';
import debounce from 'lodash/debounce';
import {
  IContextualMenuItem,
  ContextualMenu,
  DirectionalHint,
  IContextualMenuStyles,
} from 'office-ui-fabric-react/lib/ContextualMenu';
import { SharedColors } from '@uifabric/fluent-theme';
import { useRecoilValue } from 'recoil';
import { UserSettings } from '@botframework-composer/types';

import {
  currentProjectIdState,
  dispatcherState,
  userSettingsState,
  watchedVariablesState,
} from '../../../../recoilModel';
import TelemetryClient from '../../../../telemetry/TelemetryClient';

import { PropertyItem } from './utils/components/PropertyTreeItem';
import { computePropertyItemTree, getAllNodes, WatchDataPayload } from './utils/helpers';
import { getPickerContextualMenuItem } from './utils/components/PickerContextualMenuItem';
import { getMemoryVariablesForProject } from './utils/helpers';

type WatchVariablePickerProps = {
  path: string;
  disabled?: boolean;
  variableId: string;
};

const getStrings = () => {
  return {
    emptyMessage: formatMessage('No properties found'),
    searchPlaceholder: formatMessage('Add property path to watch'),
  };
};

const textFieldStyles = (userSettings: UserSettings, errorMessage?: string): Partial<ITextFieldStyles> => ({
  field: {
    fontFamily: userSettings.codeEditor.fontSettings.fontFamily,
    fontSize: userSettings.codeEditor.fontSettings.fontSize,
    fontWeight: userSettings.codeEditor.fontSettings.fontWeight as any,
  },
  fieldGroup: {
    backgroundColor: 'transparent',
    height: 28, // row is 32px high with 2px padding on top and bottom
  },
  root: {
    padding: '2px 0',
    selectors: {
      '.ms-TextField-fieldGroup': {
        border: 'none',
        outline: errorMessage ? `2px solid ${SharedColors.red20}` : 'none',
      },
    },
  },
});

const contextualMenuStyles: Partial<IContextualMenuStyles> = {
  root: {
    maxHeight: '200px',
    overflowY: 'auto',
    width: '240px',
  },
};

const pickerContainer = css`
  margin: '0';
  width: '240px';
`;

export const WatchVariablePicker = React.memo((props: WatchVariablePickerProps) => {
  const currentProjectId = useRecoilValue(currentProjectIdState);
  const watchedVariables = useRecoilValue(watchedVariablesState(currentProjectId));
  const { setWatchedVariables } = useRecoilValue(dispatcherState);
  const { path, variableId } = props;
  const [errorMessage, setErrorMessage] = useState('');
  const [payload, setPayload] = useState<WatchDataPayload>({ kind: 'property', data: { properties: [] } });
  const [query, setQuery] = useState<string | null>(null);
  const inputBoxElementRef = useRef<ITextField | null>(null);
  const pickerContainerElementRef = useRef<null | HTMLDivElement>(null);
  const [showContextualMenu, setShowContextualMenu] = React.useState(false);
  const [items, setItems] = useState<IContextualMenuItem[]>([]);
  const [propertyTreeExpanded, setPropertyTreeExpanded] = React.useState<Record<string, boolean>>({});
  const uiStrings = useMemo(() => getStrings(), []);
  const userSettings = useRecoilValue(userSettingsState);

  useEffect(() => {
    if (showContextualMenu) {
      // fetch the bot's available memory variables when the picker is opened
      (async () => {
        const memoryVariables = await getMemoryVariablesForProject(currentProjectId, watchedVariables);
        setPayload(memoryVariables);
      })();
    }
  }, [currentProjectId, showContextualMenu, watchedVariables]);

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
        event?.preventDefault();
        const path = paths[node.id];
        setQuery(path);
        setErrorMessage('');
        TelemetryClient.track('StateWatchPropertyAdded', { property: path });
        setWatchedVariables(currentProjectId, { ...watchedVariables, [variableId]: path });
        onHideContextualMenu();
      },
      data: {
        node,
        path: paths[node.id],
        level: levels[node.id] - 1,
        onToggleExpand,
      },
      itemProps: {
        styles: {
          root: { padding: 0 },
        },
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
        setQuery(path);
        setErrorMessage('');
        TelemetryClient.track('StateWatchPropertyAdded', { property: path });
        setWatchedVariables(currentProjectId, { ...watchedVariables, [variableId]: path });
        onHideContextualMenu();
      },
      data: {
        node,
        path: paths[node.id],
        level: 0,
      },
      itemProps: {
        styles: {
          root: { padding: 0 },
        },
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
          TelemetryClient.track('StateWatchPropertyAdded', { property: query });
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
        styles={textFieldStyles(userSettings, errorMessage)}
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
        styles={contextualMenuStyles}
        target={pickerContainerElementRef.current}
        onDismiss={onDismiss}
        onItemClick={onHideContextualMenu}
      />
    </div>
  );
});
