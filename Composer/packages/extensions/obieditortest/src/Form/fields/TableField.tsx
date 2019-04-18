import React, { useState } from 'react';
import {
  ContextualMenu,
  ContextualMenuItemType,
  DetailsList,
  PrimaryButton,
  SelectionMode,
  createTheme,
  IContextualMenuItem,
} from 'office-ui-fabric-react';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import { ColorClassNames, FontClassNames } from '@uifabric/styling';
import startCase from 'lodash.startcase';
import formatMessage from 'format-message';
import { IColumn } from 'office-ui-fabric-react';
import { JSONSchema6 } from 'json-schema';

import { buildDialogOptions, swap, remove } from '../utils';
import { FormContext } from '../types';

const fieldHeaderTheme = createTheme({
  fonts: {
    medium: {
      fontSize: '18px',
    },
  },
});

interface TableFieldProps<T> {
  additionalColumns?: IColumn[];
  defaultItem: object;
  filterNewOptions?: (item: string) => boolean;
  formContext: FormContext;
  formData: object[];
  label: string;
  navPrefix: string;
  onChange: (items: T[]) => void;
  renderTitle: (item: T) => string;
  name?: string;
  schema: JSONSchema6;
}

interface DetailItem<T> {
  item: T;
  index: number;
  target: HTMLElement;
}

export const TableField: React.FunctionComponent<TableFieldProps<object>> = props => {
  const [currentItem, setCurrentItem] = useState<DetailItem<object> | null>(null);
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

  const onItemContextMenu = (item: object, index: number | undefined, e: Event | undefined) => {
    const ev = e as Event;
    ev.preventDefault();
    const target = ev.target as HTMLElement;

    setCurrentItem({ item, index: index as number, target: target.parentElement || target });
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

  const menuItems: IContextualMenuItem[] = currentItem
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
          disabled: currentItem.index === 0,
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
          disabled: currentItem.index === items.length - 1,
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
};

TableField.defaultProps = {
  additionalColumns: [],
  filterNewOptions: () => true,
  formData: [],
  navPrefix: '',
  onChange: () => {},
};
