// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { ConversationActivityTrafficItem, Activity } from '@botframework-composer/types';
import { IIconProps } from 'office-ui-fabric-react/lib/Icon';
import { CommandBarButton } from 'office-ui-fabric-react/lib/Button';
import {
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  SelectionMode,
  Selection,
  IObjectWithKey,
} from 'office-ui-fabric-react/lib/DetailsList';
import formatMessage from 'format-message';
import { JsonEditor } from '@bfc/code-editor';
import produce from 'immer';

import { DebugPanelTabHeaderProps } from '../types';
import { rootBotProjectIdSelector, webChatTrafficState } from '../../../../../recoilModel';
import { getDefaultFontSettings } from '../../../../../recoilModel/utils/fontUtil';
import { WatchVariablePicker } from '../../WatchVariableSelector/WatchVariablePicker';
import { getMemoryVariables } from '../../../../../recoilModel/dispatchers/utils/project';

const DEFAULT_FONT_SETTINGS = getDefaultFontSettings();

const contentContainer = css`
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  width: 100%;
`;

const toolbar = css`
  display: flex;
  flex-flow: row nowrap;
  height: 24px;
  padding: 8px 16px;
`;

const content = css`
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  width: 100%;
  overflow-y: scroll;
`;

const editorStyles = css`
  border: none;
`;

const objectCell = css`
  height: 160px;
  width: 360px;
`;

const addIcon: IIconProps = {
  iconName: 'Add',
};

const removeIcon: IIconProps = {
  iconName: 'Cancel',
};

const NameColumnKey = 'column1';
const ValueColumnKey = 'column2';
const watchTableColumns: IColumn[] = [
  { key: NameColumnKey, name: 'Name', fieldName: 'name', minWidth: 100, maxWidth: 200, isResizable: true },
  { key: ValueColumnKey, name: 'Value', fieldName: 'value', minWidth: 100, maxWidth: 360, isResizable: true },
];

const watchTableLayout: DetailsListLayoutMode = DetailsListLayoutMode.fixedColumns;

// this can be exported and used in other places
const getValueFromBotTraceScope = (delimitedProperty: string, botTrace: Activity) => {
  const propertySegments = delimitedProperty.split('.');
  const value = propertySegments.reduce(
    (accumulator: object | string | number | boolean | undefined, segment, index) => {
      // first try to grab the specified property off the root of the bot trace's memory
      if (index === 0) {
        return botTrace?.value[segment];
      }
      // if we are not on the root, try accessing the next value of the desired property
      if (typeof accumulator === 'object') {
        return accumulator[segment];
      } else {
        return undefined;
      }
    },
    undefined
  );
  return value;
};

export const WatchTabContent: React.FC<DebugPanelTabHeaderProps> = ({ isActive }) => {
  const currentProjectId = useRecoilValue(rootBotProjectIdSelector);
  const rawWebChatTraffic = useRecoilValue(webChatTrafficState(currentProjectId ?? ''));
  const [watchVariables, setWatchVariable] = useState<Record<string, string>>({});

  const [selectedItems, setSelectedItems] = useState<IObjectWithKey[]>();

  const selection = useMemo(
    () =>
      new Selection({
        onSelectionChanged: () => {
          //console.log('handle selection change',selection.getSelection())
          setSelectedItems(selection.getSelection());
        },
        selectionMode: SelectionMode.multiple,
      }),
    []
  );

  const [memoryVariablesPayload, setMemoryVariablesPayload] = useState<WatchDataPayload>({
    kind: 'property',
    data: { properties: [] },
  });

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
      setWatchVariable({
        ...watchVariables,
        [variableId]: path,
      });
    },
    [watchVariables]
  );

  // we need to refresh the details list every time a new bot state comes in
  const refreshedWatchedProperties = useMemo(() => {
    return Object.entries(watchVariables).map(([key, value]) => {
      return {
        key,
        value,
      };
    });
  }, [mostRecentBotState, watchVariables]);

  const renderColumn = useCallback(
    (item: { key: string; value: string }, index: number | undefined, column: IColumn | undefined) => {
      if (column && index !== undefined) {
        if (column.key === NameColumnKey) {
          // render picker
          return (
            <WatchVariablePicker
              key={item.key}
              path={item.value}
              payload={memoryVariablesPayload}
              variableId={item.key}
              onSelectPath={onSelectPath}
            />
          );
          //return <span>{item}</span>;
        } else if (column.key === ValueColumnKey) {
          // render the value display
          if (mostRecentBotState) {
            const value = getValueFromBotTraceScope(item.value, mostRecentBotState?.activity);
            if (typeof value === 'object') {
              // render monaco view
              // TODO: is there some way we can expand the height of the cell based on the number of object keys?
              return (
                <div css={objectCell}>
                  <JsonEditor
                    editorSettings={{
                      fadedWhenReadOnly: false,
                      fontSettings: {
                        fontFamily: DEFAULT_FONT_SETTINGS.fontFamily,
                        fontSize: '12px',
                        fontWeight: 'normal',
                      },
                    }}
                    options={{
                      folding: true,
                      minimap: { enabled: false, showSlider: 'mouseover' },
                      showFoldingControls: 'always',
                      readOnly: true,
                      lineHeight: 16,
                    }}
                    styleOverrides={[editorStyles]}
                    value={value}
                    onChange={(_d) => null}
                  />
                </div>
              );
            } else if (value === undefined) {
              // don't render anything
              return null;
            } else {
              // render primitive view
              return <span>{String(value)}</span>;
            }
          } else {
            // no bot trace available
            return null;
          }
        }
      }
      return null;
    },
    [mostRecentBotState, memoryVariablesPayload, watchVariables]
  );

  const onClickAdd = useCallback(() => {
    setWatchVariable({
      ...watchVariables,
      [uuidv4()]: '',
    });
  }, [watchVariables]);

  const onClickRemove = () => {
    const updated = produce(watchVariables, (draftState) => {
      if (selectedItems?.length) {
        selectedItems.map((item: IObjectWithKey) => {
          delete draftState[item.key as string];
        });
      }
    });
    setWatchVariable(updated);
  };

  if (isActive) {
    return (
      <div css={contentContainer}>
        {/** TODO: factor toolbar and content out into own components? */}
        <div css={toolbar}>
          <CommandBarButton iconProps={addIcon} text={formatMessage('Add property')} onClick={onClickAdd} />
          <CommandBarButton iconProps={removeIcon} text={formatMessage('Remove from list')} onClick={onClickRemove} />
        </div>
        <div css={content}>
          <DetailsList
            columns={watchTableColumns}
            items={refreshedWatchedProperties}
            layoutMode={watchTableLayout}
            selection={selection}
            selectionMode={SelectionMode.multiple}
            onRenderItemColumn={renderColumn}
          />
        </div>
      </div>
    );
  } else {
    return null;
  }
};
