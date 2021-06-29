// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { ConversationActivityTrafficItem, Activity } from '@botframework-composer/types';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { CommandBar, ICommandBarStyles } from 'office-ui-fabric-react/lib/CommandBar';
import {
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  SelectionMode,
  Selection,
  IObjectWithKey,
  IDetailsRowProps,
  DetailsRow,
  IDetailsListStyles,
  IDetailsRowStyles,
  IDetailsHeaderStyles,
} from 'office-ui-fabric-react/lib/DetailsList';
import formatMessage from 'format-message';
import get from 'lodash/get';
import { ScrollablePane } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { CommunicationColors, FluentTheme } from '@uifabric/fluent-theme';

import { DebugPanelTabHeaderProps } from '../types';
import {
  currentProjectIdState,
  dispatcherState,
  watchedVariablesState,
  webChatTrafficState,
} from '../../../../../recoilModel';
import { WatchVariablePicker } from '../../WatchVariablePicker/WatchVariablePicker';
import { getMemoryVariables } from '../../../../../recoilModel/dispatchers/utils/project';
import { WatchDataPayload } from '../../WatchVariablePicker/utils/helpers';

import { WatchTabObjectValue } from './WatchTabObjectValue';

const toolbarHeight = 24;

const unavailbleValue = css`
  font-family: ${FluentTheme.fonts.small.fontFamily};
  font-size: ${FluentTheme.fonts.small.fontSize};
  font-style: italic;
  height: 16px;
  line-height: 16px;
`;

const primitiveValue = css`
  font-family: ${FluentTheme.fonts.small.fontFamily};
  font-size: ${FluentTheme.fonts.small.fontSize};
  color: ${CommunicationColors.shade10};
  height: 16px;
  line-height: 16px;
`;

const watchTableStyles: Partial<IDetailsListStyles> = {
  root: {
    maxHeight: `calc(100% - ${toolbarHeight}px)`,
  },
  contentWrapper: {
    overflowY: 'auto' as any,
    // fill remaining space after table header row
    height: 'calc(100% - 60px)',
  },
};

const rowStyles: Partial<IDetailsRowStyles> = {
  cell: { minHeight: 32, padding: '8px 6px' },
  checkCell: {
    height: 32,
    minHeight: 32,
    selectors: {
      '& > div[role="checkbox"]': {
        height: 32,
      },
    },
  },
  root: { minHeight: 32 },
};

const commandBarStyles: Partial<ICommandBarStyles> = { root: { height: toolbarHeight, padding: 0 } };
const detailsHeaderStyles: Partial<IDetailsHeaderStyles> = {
  root: {
    paddingTop: 0,
  },
};

const NameColumnKey = 'watchTabNameColumn';
const ValueColumnKey = 'watchTabValueColumn';

const watchTableLayout: DetailsListLayoutMode = DetailsListLayoutMode.justified;

// Returns the specified property from the bot state trace if it exists.
// Ex. getValueFromBotTraceMemory('user.address.city', trace)
export const getValueFromBotTraceMemory = (
  valuePath: string,
  botTrace: Activity
): { value: any; propertyIsAvailable: boolean } => {
  const pathSegments = valuePath.split('.');
  pathSegments.pop();
  const parentValuePath = pathSegments.join('.');
  const parentPropertyValue = get(botTrace?.value, parentValuePath, undefined);
  return {
    // if the parent key to the desired property is an object then the property is available
    propertyIsAvailable: parentPropertyValue !== null && typeof parentPropertyValue === 'object',
    value: get(botTrace?.value, valuePath, undefined),
  };
};

export const WatchTabContent: React.FC<DebugPanelTabHeaderProps> = ({ isActive }) => {
  const currentProjectId = useRecoilValue(currentProjectIdState);
  const rawWebChatTraffic = useRecoilValue(webChatTrafficState(currentProjectId));
  const watchedVariables = useRecoilValue(watchedVariablesState(currentProjectId));
  const { setWatchedVariables } = useRecoilValue(dispatcherState);
  const [uncommittedWatchedVariables, setUncommittedWatchedVariables] = useState<Record<string, string>>({});
  const [selectedVariables, setSelectedVariables] = useState<IObjectWithKey[]>();
  const [memoryVariablesPayload, setMemoryVariablesPayload] = useState<WatchDataPayload>({
    kind: 'property',
    data: { properties: [] },
  });

  const watchedVariablesSelection = useRef(
    new Selection({
      onSelectionChanged: () => {
        setSelectedVariables(watchedVariablesSelection.current.getSelection());
      },
      selectionMode: SelectionMode.multiple,
    })
  );

  // reset state when switching to a new project
  useEffect(() => {
    setUncommittedWatchedVariables({});
  }, [currentProjectId]);

  // get memory scope variables for the bot
  useEffect(() => {
    const abortController = new AbortController();
    (async () => {
      try {
        const watched = Object.values(watchedVariables);
        let variables = await getMemoryVariables(currentProjectId, { signal: abortController.signal });
        // we don't want to show variables that are already being watched
        variables = variables.filter((v) => !watched.find((watchedV) => watchedV === v));

        setMemoryVariablesPayload({ kind: 'property', data: { properties: variables } });
      } catch (e) {
        // error can be due to abort
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [currentProjectId, watchedVariables]);

  const mostRecentBotState = useMemo(() => {
    const botStateTraffic = rawWebChatTraffic.filter(
      (t) => t.trafficType === 'activity' && t.activity.type === 'trace' && t.activity.name === 'BotState'
    ) as ConversationActivityTrafficItem[];
    if (botStateTraffic.length) {
      return botStateTraffic[botStateTraffic.length - 1];
    }
  }, [rawWebChatTraffic]);

  const onRenderVariableName = useCallback(
    (item: { key: string; value: string }, index: number | undefined, column: IColumn | undefined) => {
      return (
        <WatchVariablePicker key={item.key} path={item.value} payload={memoryVariablesPayload} variableId={item.key} />
      );
    },
    [memoryVariablesPayload]
  );

  const onRenderVariableValue = useCallback(
    (item: { key: string; value: string }, index: number | undefined, column: IColumn | undefined) => {
      if (mostRecentBotState) {
        const variable = watchedVariables[item.key];
        if (variable === undefined) {
          // the variable has not been committed yet
          return null;
        }
        // try to determine the value and render it accordingly
        const { propertyIsAvailable, value } = getValueFromBotTraceMemory(variable, mostRecentBotState?.activity);
        if (propertyIsAvailable) {
          if (value !== null && typeof value === 'object') {
            // render monaco view
            return <WatchTabObjectValue value={value} />;
          } else if (value === undefined) {
            return <span css={primitiveValue}>{formatMessage('undefined')}</span>;
          } else {
            // render primitive view
            return <span css={primitiveValue}>{typeof value === 'string' ? `"${value}"` : String(value)}</span>;
          }
        } else {
          // the value is not available
          return <span css={unavailbleValue}>{formatMessage('not available')}</span>;
        }
      } else {
        // no bot trace available - render "not available" for committed variables, and nothing for uncommitted variables
        return watchedVariables[item.key] !== undefined ? (
          <span css={unavailbleValue}>{formatMessage('not available')}</span>
        ) : null;
      }
    },
    [mostRecentBotState, watchedVariables]
  );

  // TODO: update to office-ui-fabric-react@7.170.x to gain access to "flexGrow" column property to distribute proprotional column widths
  // (name column takes up 1/3 of space and value column takes up the remaining 2/3)
  const watchTableColumns: IColumn[] = useMemo(
    () => [
      {
        key: NameColumnKey,
        name: 'Name',
        fieldName: 'name',
        minWidth: 100,
        maxWidth: 600,
        isResizable: true,
        onRender: onRenderVariableName,
      },
      {
        key: ValueColumnKey,
        name: 'Value',
        fieldName: 'value',
        minWidth: 100,
        maxWidth: undefined,
        isResizable: true,
        onRender: onRenderVariableValue,
      },
    ],
    [onRenderVariableName, onRenderVariableValue]
  );

  // we need to refresh the details list when we get a new bot state, add a new row, or submit a variable to watch
  const refreshedWatchedVariables = useMemo(() => {
    // merge any committed variables into the uncommitted list so that state
    // is saved when the user collapses the panel or switches to another tab
    return Object.entries(uncommittedWatchedVariables).map(([key, value]) => {
      return {
        key,
        value: watchedVariables[key] ?? value,
      };
    });
  }, [mostRecentBotState, uncommittedWatchedVariables, watchedVariables]);

  const renderRow = useCallback((props?: IDetailsRowProps) => {
    return props ? <DetailsRow {...props} styles={rowStyles} /> : null;
  }, []);

  const onClickAdd = useCallback(() => {
    setUncommittedWatchedVariables({
      ...uncommittedWatchedVariables,
      [uuidv4()]: '',
    });
  }, [uncommittedWatchedVariables]);

  const onClickRemove = useCallback(() => {
    const updatedUncommitted = { ...uncommittedWatchedVariables };
    const updatedCommitted = { ...watchedVariables };
    if (selectedVariables?.length) {
      selectedVariables.map((item: IObjectWithKey) => {
        delete updatedUncommitted[item.key as string];
        delete updatedCommitted[item.key as string];
      });
    }
    setWatchedVariables(currentProjectId, updatedCommitted);
    setUncommittedWatchedVariables(updatedUncommitted);
  }, [currentProjectId, selectedVariables, setWatchedVariables, setUncommittedWatchedVariables]);

  const removeIsDisabled = useMemo(() => {
    return !selectedVariables?.length;
  }, [selectedVariables]);

  const onRenderDetailsHeader = (props, defaultRender) => {
    return (
      <Sticky isScrollSynced stickyPosition={StickyPositionType.Header}>
        {defaultRender({
          ...props,
          onRenderColumnHeaderTooltip: (tooltipHostProps) => <TooltipHost {...tooltipHostProps} />,
          styles: detailsHeaderStyles,
        })}
      </Sticky>
    );
  };

  if (!isActive) {
    return null;
  }

  return (
    <Stack verticalFill>
      <CommandBar
        css={{
          height: `${toolbarHeight}px`,
          padding: '8px 16px 16px 16px',
          alignItems: 'center',
        }}
        items={[
          {
            key: 'addProperty',
            text: formatMessage('Add property'),
            iconProps: { iconName: 'Add' },
            onClick: onClickAdd,
          },
          {
            disabled: removeIsDisabled,
            key: 'removeProperty',
            text: formatMessage('Remove from list'),
            iconProps: { iconName: 'Cancel' },
            onClick: onClickRemove,
          },
        ]}
        styles={commandBarStyles}
      />
      <Stack.Item
        css={{
          height: `calc(100% - 55px)`,
          position: 'relative',
        }}
      >
        <ScrollablePane>
          <DetailsList
            columns={watchTableColumns}
            items={refreshedWatchedVariables}
            layoutMode={watchTableLayout}
            selection={watchedVariablesSelection.current}
            selectionMode={SelectionMode.multiple}
            styles={watchTableStyles}
            onRenderDetailsHeader={onRenderDetailsHeader}
            onRenderRow={renderRow}
          />
        </ScrollablePane>
      </Stack.Item>
    </Stack>
  );
};
