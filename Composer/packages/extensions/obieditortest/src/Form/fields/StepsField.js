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

export function StepsField(props) {
  const [currentItem, setCurrentItem] = useState(null);

  const columns = [
    {
      key: 'column1',
      name: 'Type',
      minWidth: 140,
      maxWidth: 200,
      data: 'string',
      onRender: item => {
        return item.$type || 'New Step';
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
            props.formContext.shellApi.focusTo(`.steps[${currentItem.index}]`);
            props.formContext.shellApi.navDown(`.steps[${currentItem.index}]`);
            return false;
          },
        },
        {
          key: 'moveUp',
          text: 'Move Up',
          iconProps: { iconName: 'CaretSolidUp' },
          onClick: () => {
            const steps = swap(items, currentItem.index, currentItem.index - 1);
            onChange(steps);
            return false;
          },
        },
        {
          key: 'moveDown',
          text: 'Move Down',
          iconProps: { iconName: 'CaretSolidDown' },
          onClick: () => {
            const steps = swap(items, currentItem.index, currentItem.index + 1);
            onChange(steps);
            return false;
          },
        },
        {
          key: 'remove',
          text: 'Remove',
          iconProps: { iconName: 'Cancel' },
          onClick: () => {
            const steps = remove(items, currentItem.index);
            onChange(steps);
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
            onChange({ $type: 'Microsoft.SendActivity' });
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
          onChange({ $type: 'Microsoft.SendActivity' });
          return true;
        }}
        split
        menuProps={{ items: buildDialogOptions(onChange, item => !item.includes('Rule')) }}
      >
        Add New Step
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
