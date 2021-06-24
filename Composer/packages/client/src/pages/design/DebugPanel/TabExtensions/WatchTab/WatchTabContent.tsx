// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { ConversationActivityTrafficItem, Activity } from '@botframework-composer/types';
import { IIconProps } from 'office-ui-fabric-react/lib/Icon';
import { CommandBarButton } from 'office-ui-fabric-react/lib/Button';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
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
} from 'office-ui-fabric-react/lib/DetailsList';
import formatMessage from 'format-message';
import get from 'lodash/get';
import { ScrollablePane } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';

import { DebugPanelTabHeaderProps } from '../types';
import { rootBotProjectIdSelector, webChatTrafficState } from '../../../../../recoilModel';
import { WatchVariablePicker } from '../../WatchVariablePicker/WatchVariablePicker';
import { getMemoryVariables } from '../../../../../recoilModel/dispatchers/utils/project';
import { WatchDataPayload } from '../../WatchVariablePicker/utils/helpers';

import { WatchTabObjectValue } from './WatchTabObjectValue';

const toolbarHeight = 24;

const undefinedValue = css`
  font-family: Segoe UI;
  font-size: 12px;
  font-style: italic;
  height: 16px;
  line-height: 16px;
`;

const watchTableStyles: Partial<IDetailsListStyles> = {
  root: {
    maxHeight: `calc(100% - ${toolbarHeight}px)`,
  },
  contentWrapper: {
    overflowY: 'auto' as 'auto',
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

const addIcon: IIconProps = {
  iconName: 'Add',
};

const removeIcon: IIconProps = {
  iconName: 'Cancel',
};

const NameColumnKey = 'watchTabNameColumn';
const ValueColumnKey = 'watchTabValueColumn';
// TODO: update to office-ui-fabric-react@7.170.x to gain access to "flexGrow" column property to distribute proprotional column widths
// (name column takes up 1/3 of space and value column takes up the remaining 2/3)
const watchTableColumns: IColumn[] = [
  {
    key: NameColumnKey,
    name: 'Name',
    fieldName: 'name',
    minWidth: 100,
    maxWidth: 600,
    isResizable: true,
  },
  {
    key: ValueColumnKey,
    name: 'Value',
    fieldName: 'value',
    minWidth: 100,
    maxWidth: undefined,
    isResizable: true,
  },
];

const watchTableLayout: DetailsListLayoutMode = DetailsListLayoutMode.justified;

// Returns the specified property from the bot state trace if it exists.
// Ex. getValueFromBotTraceMemory('user.address.city', trace)
const getValueFromBotTraceMemory = (valuePath: string, botTrace: Activity) => {
  return get(botTrace?.value, valuePath, undefined);
};

export const WatchTabContent: React.FC<DebugPanelTabHeaderProps> = () => {
  const currentProjectId = useRecoilValue(rootBotProjectIdSelector);
  const rawWebChatTraffic = useRecoilValue(webChatTrafficState(currentProjectId ?? ''));
  const [watchedVariables, setWatchedVariables] = useState<Record<string, string>>({});
  const [pickerErrorMessages, setPickerErrorMessages] = useState<Record<string, string>>({});
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

  // get memory scope variables for the bot
  useEffect(() => {
    if (currentProjectId) {
      const abortController = new AbortController();
      (async () => {
        try {
          const variables = await getMemoryVariables(currentProjectId, { signal: abortController.signal });
          setMemoryVariablesPayload({ kind: 'property', data: { properties: variables } });
        } catch (e) {
          // error can be due to abort
        }
      })();
    }
  }, [currentProjectId]);

  const mostRecentBotState = useMemo(() => {
    const botStateTraffic = rawWebChatTraffic.filter(
      (t) => t.trafficType === 'activity' && t.activity.type === 'trace' && t.activity.name === 'BotState'
    ) as ConversationActivityTrafficItem[];
    if (botStateTraffic.length) {
      return botStateTraffic[botStateTraffic.length - 1];
    }
  }, [rawWebChatTraffic]);

  const onSelectPath = useCallback(
    (variableId: string, path: string) => {
      const watchedVar = Object.values(watchedVariables).find((varPath) => varPath === path);
      if (watchedVar) {
        // the variable is already being watched, so display a validation error under the picker
        setPickerErrorMessages({
          ...pickerErrorMessages,
          [variableId]: formatMessage('You are already watching this property.'),
        });
      } else {
        setWatchedVariables({
          ...watchedVariables,
          [variableId]: path,
        });
        // clear any error messages for the variable
        delete pickerErrorMessages[variableId];
        setPickerErrorMessages({ ...pickerErrorMessages });
      }
    },
    [pickerErrorMessages, watchedVariables]
  );

  // we need to refresh the details list every time a new bot state comes in
  const refreshedWatchedVariables = useMemo(() => {
    return Object.entries(watchedVariables).map(([key, value]) => ({
      key,
      value,
    }));
  }, [mostRecentBotState, pickerErrorMessages, watchedVariables]);

  const renderRow = useCallback((props?: IDetailsRowProps) => {
    return props ? <DetailsRow {...props} styles={rowStyles} /> : null;
  }, []);

  const renderColumn = useCallback(
    (item: { key: string; value: string }, index: number | undefined, column: IColumn | undefined) => {
      if (column && index !== undefined) {
        if (column.key === NameColumnKey) {
          // render picker
          return (
            <WatchVariablePicker
              key={item.key}
              errorMessage={pickerErrorMessages[item.key]}
              path={item.value}
              payload={memoryVariablesPayload}
              variableId={item.key}
              onSelectPath={onSelectPath}
            />
          );
        } else if (column.key === ValueColumnKey) {
          // render the value display
          if (mostRecentBotState) {
            const value = getValueFromBotTraceMemory(item.value, mostRecentBotState?.activity);
            if (value !== null && typeof value === 'object') {
              // render monaco view
              return <WatchTabObjectValue value={value} />;
            } else if (value === undefined) {
              // render undefined indicator
              return <span css={undefinedValue}>{formatMessage('undefined')}</span>;
            } else {
              // render primitive view
              return <span>{String(value)}</span>;
            }
          } else {
            // no bot trace available;
            // render undefined indicator
            return <span css={undefinedValue}>{formatMessage('undefined')}</span>;
          }
        }
      }
      return null;
    },
    [pickerErrorMessages, mostRecentBotState, memoryVariablesPayload, watchedVariables]
  );

  const onClickAdd = useCallback(() => {
    setWatchedVariables({
      ...watchedVariables,
      [uuidv4()]: '',
    });
  }, [watchedVariables]);

  const onClickRemove = () => {
    const updated = { ...watchedVariables };
    if (selectedVariables?.length) {
      selectedVariables.map((item: IObjectWithKey) => {
        delete updated[item.key as string];
      });
    }
    setWatchedVariables(updated);
  };

  const removeIsDisabled = useMemo(() => {
    return !selectedVariables?.length;
  }, [selectedVariables]);

  function onRenderDetailsHeader(props, defaultRender) {
    return (
      <Sticky isScrollSynced stickyPosition={StickyPositionType.Header}>
        {defaultRender({
          ...props,
          onRenderColumnHeaderTooltip: (tooltipHostProps) => <TooltipHost {...tooltipHostProps} />,
        })}
      </Sticky>
    );
  }

  return (
    <Stack verticalFill>
      <Stack.Item
        css={{
          height: `${toolbarHeight}px`,
          marginTop: '14px',
          padding: '0 16px',
          alignItems: 'center',
        }}
      >
        <CommandBarButton iconProps={addIcon} text={formatMessage('Add property')} onClick={onClickAdd} />
        <CommandBarButton
          disabled={removeIsDisabled}
          iconProps={removeIcon}
          text={formatMessage('Remove from list')}
          onClick={onClickRemove}
        />
      </Stack.Item>
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
            onRenderItemColumn={renderColumn}
            onRenderRow={renderRow}
          />
        </ScrollablePane>
      </Stack.Item>
    </Stack>
  );
};
