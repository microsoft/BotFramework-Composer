// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import styled from '@emotion/styled';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { FluentTheme, NeutralColors } from '@uifabric/fluent-theme';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { List } from 'office-ui-fabric-react/lib/List';

import { ResourcesItem } from '../types';

// ---------- Styles ---------- //

const ItemCheckbox = styled(Checkbox)`
  margin: 4px 10px 0 0;
  padding: 5px;
`;

const checkBoxStyle = {
  label: {
    alignItems: 'flex-start',
  },
};

const ItemLabel = styled(Stack)`
  margin-left: 15px !important;
`;

const ItemHeader = styled(Stack)``;

const ImageIcon = styled.img`
  width: 16px;
  height: 16px;
  margin: 4px 0 0 0;
  user-select: none;
`;

const ImageIconPlacholder = styled.div`
  width: 16px;
  height: 16px;
  margin: 4px 0 0 0;
  user-select: none;
`;

const ItemText = styled(Text)`
  font-size: ${FluentTheme.fonts.mediumPlus.fontSize};
  margin-left: 4px !important;
`;

const ItemTier = styled(Text)`
  font-size: ${FluentTheme.fonts.small.fontSize};
  margin: 4px 0 0 22px;
  color: ${NeutralColors.gray130};
`;

const ItemDescription = styled(Text)`
  font-size: ${FluentTheme.fonts.medium.fontSize};
  margin: 4px 2px 0 22px;
  color: ${NeutralColors.gray190};
  max-width: 500px;
`;

// ---------- ChooseResourcesList ---------- //

type ResourceListItem = ResourcesItem & { icon?: string };

type Props = {
  /**
   * The resources to list in order.
   */
  items: ResourceListItem[];
  /**
   * The keys of the resources that should be selected.
   */
  selectedKeys?: string[];
  /**
   * Raised whenever the selection of keys changes.
   */
  onSelectionChanged?: (selectedKeys: string[]) => void;
};

/**
 * Provides a selectable list control of resources.
 * Displays the text, tier, description, and optional icon.
 * Raises a callback of the selected keys.
 * Allows for uncontrolled or controlled selected keys.
 */
export const ChooseResourcesList = (props: Props) => {
  const { items, selectedKeys: controlledSelectedKeys, onSelectionChanged } = props;

  // ----- Hooks

  const getInitialSelectedKeys = () => {
    return controlledSelectedKeys || items.filter((item) => item.required).map((item) => item.key);
  };

  const [selectedKeys, setSelectedKeys] = React.useState<string[]>(getInitialSelectedKeys);

  // When the items or controlled selection changes, update selection state.
  React.useEffect(() => {
    setSelectedKeys(getInitialSelectedKeys());
  }, [items, controlledSelectedKeys]);

  // ----- Handlers

  const onCheckboxChanged = (ev: React.FormEvent<HTMLElement>, checked: boolean, item: ResourceListItem): void => {
    let newSelectedKeys = undefined;
    if (item.required || checked) {
      if (!selectedKeys.includes(item.ke)) {
        newSelectedKeys = [...selectedKeys, item.key];
      }
    } else {
      newSelectedKeys = selectedKeys.filter((i: string) => i !== item.key);
    }

    setSelectedKeys(newSelectedKeys);

    if (onSelectionChanged) {
      onSelectionChanged(newSelectedKeys);
    }
  };

  // ----- Render

  const renderItemLabel = (item: ResourceListItem) => {
    return (
      <ItemLabel>
        <ItemHeader horizontal>
          {item.icon ? (
            <ImageIcon height="16" role="presentation" src={item.icon} width="16" />
          ) : (
            <ImageIconPlacholder />
          )}
          <ItemText>{item.text}</ItemText>
        </ItemHeader>
        <ItemTier>{item.tier}</ItemTier>
        <ItemDescription>{item.description}</ItemDescription>
      </ItemLabel>
    );
  };

  const renderItem = (item: ResourceListItem) => {
    const checked = item.required || !!selectedKeys.includes(item.key);
    return (
      <ItemCheckbox
        key={item.key}
        data-is-focusable
        checked={checked}
        disabled={item.required}
        styles={checkBoxStyle}
        onChange={(e, c) => onCheckboxChanged(e, c, item)}
        onRenderLabel={() => renderItemLabel(item)}
      />
    );
  };

  return (
    <FocusZone direction={FocusZoneDirection.vertical}>
      <List items={items} onRenderCell={renderItem} />
    </FocusZone>
  );
};
