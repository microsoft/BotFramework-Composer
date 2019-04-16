import React, { useState } from 'react';
import {
  ContextualMenu,
  ContextualMenuItemType,
  DetailsList,
  PrimaryButton,
  SelectionMode,
  createTheme,
} from 'office-ui-fabric-react';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import { ColorClassNames, FontClassNames } from '@uifabric/styling';
import startCase from 'lodash.startcase';
import formatMessage from 'format-message';

import { buildDialogOptions, swap, remove } from '../utils';
import { IColumn } from 'office-ui-fabric-react';
import { FieldProps } from 'react-jsonschema-form';
import { FormContext } from '../types';

const fieldHeaderTheme = createTheme({
  fonts: {
    medium: {
      fontSize: '18px',
    },
  },
});

interface TableFieldProps<T> extends FieldProps {
  additionalColumns?: IColumn[];
  defaultItem: object;
  filterNewOptions: (item: string) => boolean;
  formContext: FormContext;
  formData: object[];
  label: string;
  navPrefix: string;
  onChange: (items: T[]) => void;
  renderTitle: (item: T) => string;
}

interface DetailItem<T> {
  item: T;
  index: number;
  target?: HTMLElement;
}

export function TableField<T = object>(props: TableFieldProps<T>) {
  const [currentItem, setCurrentItem] = useState<DetailItem<T> | null>(null);
  const { additionalColumns, defaultItem, filterNewOptions, label, navPrefix, renderTitle } = props;

  const columns = [
    {
      key: 'column1',
      name: formatMessage('Type'),
      minWidth: 140,
      maxWidth: 200,
      onRender: renderTitle,
    },
    ...(additionalColumns || []),
  ];

  const items = props.formData;

  const onItemContextMenu = (item: T, index: number | undefined, e: Event | undefined) => {
    if (index && event) {
      const ev = e as Event;
      ev.preventDefault();
      const target = ev.target as HTMLElement;

      setCurrentItem({ item, index, target: target.parentElement || target });
    }
  };

  const onChange = newItem => {
    if (Array.isArray(newItem)) {
      props.onChange(newItem);
    } else {
      props.onChange([...items, newItem]);
    }
  };

  const createNewItem = () => {
    onChange(defaultItem);
    return false;
  };

  const menuItems = currentItem
    ? [
        {
          key: 'edit',
          text: formatMessage('Edit'),
          iconProps: { iconName: 'Edit' },
          onClick: () => {
            props.formContext.shellApi.focusTo(`.${navPrefix}[${currentItem.index}]`);
            props.formContext.shellApi.navDown(`.${navPrefix}[${currentItem.index}]`);
            return false;
          },
        },
        {
          key: 'moveUp',
          text: formatMessage('Move Up'),
          iconProps: { iconName: 'CaretSolidUp' },
          onClick: () => {
            const newItems = swap(items, currentItem.index, currentItem.index - 1);
            onChange(newItems);
            return false;
          },
        },
        {
          key: 'moveDown',
          text: formatMessage('Move Down'),
          iconProps: { iconName: 'CaretSolidDown' },
          onClick: () => {
            const newItems = swap(items, currentItem.index, currentItem.index + 1);
            onChange(newItems);
            return false;
          },
        },
        {
          key: 'remove',
          text: formatMessage('Remove'),
          iconProps: { iconName: 'Cancel' },
          onClick: () => {
            const newItems = remove(items, currentItem.index);
            onChange(newItems);
            return false;
          },
        },
        {
          key: 'divider_1',
          itemType: ContextualMenuItemType.Divider,
        },
        {
          key: 'new',
          text: formatMessage('New'),
          iconProps: { iconName: 'Add' },
          onClick: createNewItem,
        },
      ]
    : [];

  return (
    <div style={{ margin: '10px 0' }}>
      <Separator theme={fieldHeaderTheme} alignContent="start" styles={{ content: { paddingLeft: '0' } }}>
        {props.schema.title || startCase(props.name)}
      </Separator>
      {props.schema.description && (
        <p className={[ColorClassNames.neutralSecondary, FontClassNames.small].join(' ')}>{props.schema.description}</p>
      )}
      <DetailsList
        columns={columns}
        items={items}
        onItemContextMenu={onItemContextMenu}
        selectionMode={SelectionMode.none}
        styles={{ root: { marginBottom: '20px' } }}
      />
      <PrimaryButton
        menuProps={{ items: buildDialogOptions(onChange, filterNewOptions) }}
        onClick={createNewItem}
        split
        type="button"
      >
        {label}
      </PrimaryButton>
      {currentItem && (
        <ContextualMenu items={menuItems} target={currentItem.target} onDismiss={() => setCurrentItem(null)} />
      )}
    </div>
  );
}

TableField.defaultProps = {
  additionalColumns: [],
  filterNewOptions: () => true,
  formData: [],
  navPrefix: '',
  onChange: () => {},
};
