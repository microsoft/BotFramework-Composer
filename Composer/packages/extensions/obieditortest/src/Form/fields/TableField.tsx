import React from 'react';
import {
  ContextualMenuItemType,
  DetailsList,
  IContextualMenuItem,
  SelectionMode,
  DetailsListLayoutMode,
  IconButton,
} from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import { IColumn } from 'office-ui-fabric-react';
import { JSONSchema6 } from 'json-schema';
import { DirectionalHint } from 'office-ui-fabric-react';
import get from 'lodash.get';
import { FieldProps } from '@bfdesigner/react-jsonschema-form';
import { NeutralColors, FontSizes } from '@uifabric/fluent-theme';

import { buildDialogOptions, swap, remove, insertAt, DialogOptionsOpts } from '../utils';
import { FormContext } from '../types';
import { COMPOUND_TYPES } from '../../schema/appschema';

import { BaseField } from './BaseField';

interface TableRenderProps<T> {
  createNewItemAtIndex: (idx?: number) => (e: any, item: IContextualMenuItem) => void;
  onChange: (newItem: T | T[]) => void;
}

interface TableFieldProps<T extends MicrosoftIDialog = MicrosoftIDialog> extends FieldProps<T[]> {
  additionalColumns?: IColumn[];
  columnHeader?: string;
  formContext: FormContext;
  formData: T[];
  navPrefix: string;
  onChange: (items: T[]) => void;
  renderTitle?: (item: T) => string;
  renderDescription?: (item: T) => string;
  name: string;
  schema: JSONSchema6;
  dialogOptionsOpts?: DialogOptionsOpts;
  children?: (props: TableRenderProps<T>) => React.ReactNode;
}

interface ItemActionsProps<T extends MicrosoftIDialog> extends TableFieldProps<T> {
  item: T;
  index?: number;
  newOptions: IContextualMenuItem[];
}

function ItemActions<T extends MicrosoftIDialog>(props: ItemActionsProps<T>) {
  const { item, navPrefix, index, onChange, formData, formContext, newOptions } = props;

  if (typeof index === 'undefined') {
    return null;
  }

  const menuItems: IContextualMenuItem[] = [
    {
      key: 'edit',
      text: formatMessage('Edit'),
      iconProps: { iconName: 'Edit' },
      onClick: () => {
        formContext.shellApi.focusTo(`.${navPrefix}[${index}]`);

        // @ts-ignore - IDialog could potentially be a string, so TS complains about $type
        if (COMPOUND_TYPES.includes(item.$type)) {
          formContext.shellApi.navDown(`.${navPrefix}[${index}]`);
        }
      },
    },
    {
      key: 'moveUp',
      text: formatMessage('Move Up'),
      iconProps: { iconName: 'CaretSolidUp' },
      disabled: index === 0,
      onClick: () => {
        const newItems = swap(formData, index, index - 1);
        onChange(newItems);
      },
    },
    {
      key: 'moveDown',
      text: formatMessage('Move Down'),
      iconProps: { iconName: 'CaretSolidDown' },
      disabled: index === formData.length - 1,
      onClick: () => {
        const newItems = swap(formData, index, index + 1);
        onChange(newItems);
      },
    },
    {
      key: 'remove',
      text: formatMessage('Remove'),
      iconProps: { iconName: 'Cancel' },
      onClick: () => {
        const item = formData[index];
        // @ts-ignore
        if (item.$type === 'Microsoft.SendActivity' && item.activity && item.activity.indexOf('bfdactivity-') !== -1) {
          // @ts-ignore
          formContext.shellApi.removeLgTemplate('common', item.activity.slice(1, item.activity.length - 1));
        }
        const newItems = remove(formData, index);
        onChange(newItems);
      },
    },
    {
      key: 'divider_1',
      itemType: ContextualMenuItemType.Divider,
    },
    {
      key: 'new',
      text: formatMessage('New'),
      subMenuProps: {
        items: newOptions,
        calloutProps: { calloutMaxHeight: 500 },
        directionalHint: DirectionalHint.rightTopEdge,
      },
    },
  ];

  return (
    <IconButton
      menuProps={{ items: menuItems }}
      menuIconProps={{ iconName: 'MoreVertical' }}
      styles={{ menuIcon: { color: NeutralColors.black, fontSize: FontSizes.size16 } }}
    />
  );
}

export function TableField<T extends MicrosoftIDialog = MicrosoftIDialog>(props: TableFieldProps<T>): JSX.Element {
  const { additionalColumns = [], columnHeader, dialogOptionsOpts, renderTitle, renderDescription, children } = props;

  const items = props.formData;

  const onChange = newItem => {
    if (Array.isArray(newItem)) {
      props.onChange(newItem);
    } else {
      props.onChange([...items, newItem]);
    }
  };

  const createNewItemAtIndex = (idx: number = items.length) => (_: any, item: IContextualMenuItem) => {
    onChange(insertAt(items, item.data, idx));
    return true;
  };

  const columns: IColumn[] = [
    {
      key: 'name',
      name: columnHeader || formatMessage('Name'),
      minWidth: 30,
      maxWidth: 150,
      isResizable: true,
      onRender: renderTitle,
    },
    {
      key: 'description',
      name: formatMessage('Description'),
      minWidth: 30,
      isResizable: true,
      onRender: renderDescription,
    },
    ...additionalColumns,
    {
      key: 'menu',
      name: '',
      minWidth: 50,
      maxWidth: 50,
      // eslint-disable-next-line react/display-name
      onRender: (item, index) => {
        return (
          <ItemActions
            {...props}
            item={item}
            index={index}
            newOptions={buildDialogOptions({
              ...dialogOptionsOpts,
              onClick: createNewItemAtIndex(typeof index === 'undefined' ? 0 : index + 1),
            })}
          />
        );
      },
    },
  ];

  return (
    <BaseField {...props}>
      {items && items.length > 0 && (
        <DetailsList
          columns={columns}
          items={items}
          selectionMode={SelectionMode.none}
          layoutMode={DetailsListLayoutMode.justified}
        />
      )}
      {children && children({ onChange, createNewItemAtIndex })}
    </BaseField>
  );
}

TableField.defaultProps = {
  additionalColumns: [],
  formData: [],
  navPrefix: '',
  onChange: () => {},
  renderTitle: item => get(item, '$designer.name', item.$type),
  renderDescription: item => get(item, '$designer.description'),
};
