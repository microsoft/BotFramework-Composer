// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import React, { useEffect, useState } from 'react';
import { List } from 'office-ui-fabric-react/lib/List';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { IStyle } from 'office-ui-fabric-react/lib/Styling';

const Details = styled.div`
  margin: 20px 0 0 36px;
`;

/** A list item in the PublishBotList */
type PublishBotListItem = {
  /**
   * The ID of the bot
   */
  id: string;
  /**
   * The name of the bot.
   */
  name: string;
};

type Props = {
  items: PublishBotListItem[];
  selectedIds?: string[];
  onSelectionChanged?: (selectedIds: string[]) => void;
  disableSelection?: boolean;
  expandedIds?: string[];
  onExpansionChanged?: (selectedIds: string[]) => void;
  defaultExpand?: boolean;
  renderDetails: (id: string) => React.ReactNode;
};

/**
 * Provides a list of bots the user can publish
 */
export const NewPublishBotList: React.FC<Props> = ({
  items,
  selectedIds: controlledSelectedIds,
  onSelectionChanged,
  disableSelection,
  expandedIds: controlledExpandedIds,
  onExpansionChanged,
  renderDetails,
}) => {
  const [listItems, setListItems] = useState(items);
  const [selectedIds, setSelectedIds] = useState<string[]>(controlledSelectedIds || []);
  const [expandedIds, setExpandedIds] = useState<string[]>(controlledExpandedIds || []);

  useEffect(() => {
    console.log('NewPublishBotList mounted');
  }, []);

  // Fluent List will not re-render when state outside of the items array changes
  // When data outside the items chagnes, the list items need to be force changed.
  useEffect(() => {
    setListItems([...items]);
  }, [items, selectedIds, expandedIds]);

  useEffect(() => {
    setSelectedIds(controlledSelectedIds || []);
  }, [controlledSelectedIds]);

  useEffect(() => {
    setExpandedIds(controlledExpandedIds || []);
  }, [controlledExpandedIds]);

  const onBotSelectChanged = (id: string, isChecked?: boolean) => {
    if (isChecked) {
      if (!selectedIds.includes(id)) {
        const newSelectedIds = [...selectedIds, id];
        setSelectedIds(newSelectedIds);
        onSelectionChanged?.(newSelectedIds);
      }
    } else {
      const newSelectedIds = selectedIds.filter((s) => s !== id);
      setSelectedIds(newSelectedIds);
      onSelectionChanged?.(newSelectedIds);
    }
  };

  const onBotExpandToggle = (id: string) => {
    if (!expandedIds.includes(id)) {
      setExpandedIds([...expandedIds, id]);
      onExpansionChanged?.(expandedIds);
    } else {
      setExpandedIds(expandedIds.filter((s) => s !== id));
      onExpansionChanged?.(expandedIds);
    }
  };

  const renderListItem = (item?: PublishBotListItem): React.ReactNode => {
    if (item) {
      const checked = selectedIds.includes(item.id);
      const expanded = expandedIds.includes(item.id);

      const chevronStyles: IStyle = {
        transform: `rotate(${expanded ? '90deg' : '0deg'})`,
        transition: 'transform 300ms',
        cursor: 'pointer',
        userSelect: 'none',
      };

      return (
        <Stack key={`bot-${item.id}`} gap={5}>
          <Stack horizontal gap={20} verticalAlign="center">
            <Icon
              iconName="ChevronRightMed"
              styles={{ root: chevronStyles }}
              onClick={() => onBotExpandToggle(item.id)}
            />
            <Checkbox
              checked={checked}
              disabled={disableSelection}
              label={item.name}
              onChange={(_, isChecked) => onBotSelectChanged(item.id, isChecked)}
            />
          </Stack>
          {expanded && <Details>{renderDetails(item.id)}</Details>}
        </Stack>
      );
    }
    return null;
  };

  return <List items={listItems} onRenderCell={renderListItem} />;
};
