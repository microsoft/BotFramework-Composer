import React, { useState } from 'react';
import {
  ContextualMenu,
  ContextualMenuItemType,
  DetailsList,
  DirectionalHint,
  PrimaryButton,
  SelectionMode,
  createTheme,
} from 'office-ui-fabric-react';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import { ColorClassNames, FontClassNames } from '@uifabric/styling';
import startCase from 'lodash.startcase';

import { buildDialogOptions, swap, remove } from '../utils';

const fieldHeaderTheme = createTheme({
  fonts: {
    medium: {
      fontSize: '18px',
    },
  },
});

export function RulesField(props) {
  const [currentItem, setCurrentItem] = useState(null);

  const columns = [
    {
      key: 'column1',
      name: 'Type',
      minWidth: 140,
      maxWidth: 200,
      onRender: item => {
        if (!item.$type) {
          return 'New Rule';
        }

        if (item.$type.includes('Intent')) {
          return item.intent || item.$type;
        }

        return item.$type;
      },
    },
    {
      key: 'column2',
      name: '# of Steps',
      data: 'number',
      onRender: item => {
        return (item.steps || []).length;
      },
    },
  ];

  const items = props.formData || [];

  const onItemContextMenu = (item, index, e) => {
    e.preventDefault();

    setCurrentItem({ item, index, target: e.target.parentElement });
  };

  const onChange = newItem => {
    if (Array.isArray(newItem)) {
      props.onChange(newItem);
    } else {
      props.onChange([...items, newItem]);
    }
  };

  const menuItems = currentItem
    ? [
        {
          key: 'edit',
          text: 'Edit',
          iconProps: { iconName: 'Edit' },
          onClick: () => {
            props.formContext.shellApi.focusTo(`.rules[${currentItem.index}]`);
            props.formContext.shellApi.navDown(`.rules[${currentItem.index}]`);
            return false;
          },
        },
        {
          key: 'moveUp',
          text: 'Move Up',
          iconProps: { iconName: 'CaretSolidUp' },
          onClick: () => {
            const rules = swap(items, currentItem.index, currentItem.index - 1);
            onChange(rules);
            return false;
          },
        },
        {
          key: 'moveDown',
          text: 'Move Down',
          iconProps: { iconName: 'CaretSolidDown' },
          onClick: () => {
            const rules = swap(items, currentItem.index, currentItem.index + 1);
            onChange(rules);
            return false;
          },
        },
        {
          key: 'remove',
          text: 'Remove',
          iconProps: { iconName: 'Cancel' },
          onClick: () => {
            const rules = remove(items, currentItem.index);
            onChange(rules);
            return false;
          },
        },
        {
          key: 'divider_1',
          itemType: ContextualMenuItemType.Divider,
        },
        {
          key: 'new',
          text: 'New',
          iconProps: { iconName: 'Add' },
          onClick: () => {
            onChange({ $type: 'Microsoft.NoMatchRule' });
            return false;
          },
        },
      ]
    : [];

  return (
    <div style={{ margin: '10px 0' }}>
      <Separator theme={fieldHeaderTheme} alignContent="start" styles={{ content: { paddingLeft: '0' } }}>
        {props.title || startCase(props.name)}
      </Separator>
      {props.schema.description && (
        <p className={[ColorClassNames.neutralSecondary, FontClassNames.small].join(' ')}>{props.schema.description}</p>
      )}
      <DetailsList
        items={items}
        columns={columns}
        selectionMode={SelectionMode.none}
        onItemContextMenu={onItemContextMenu}
        styles={{ root: { marginBottom: '20px' } }}
      />
      <PrimaryButton
        type="button"
        onClick={() => {
          onChange({ $type: 'Microsoft.NoMatchRule' });
          return true;
        }}
        split
        menuProps={{ items: buildDialogOptions(onChange, item => item.includes('Rule')) }}
      >
        Add New Rule
      </PrimaryButton>
      {currentItem && (
        <ContextualMenu
          items={menuItems}
          target={currentItem.target}
          onDismiss={() => setCurrentItem(null)}
          directionalHint={DirectionalHint.bottomLeftEdge}
        />
      )}
    </div>
  );
}
