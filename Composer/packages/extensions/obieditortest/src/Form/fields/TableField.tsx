import React from 'react';
import {
  ContextualMenuItemType,
  createTheme,
  DefaultButton,
  DetailsList,
  IContextualMenuItem,
  PrimaryButton,
  SelectionMode,
} from 'office-ui-fabric-react';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import { ColorClassNames, FontClassNames } from '@uifabric/styling';
import startCase from 'lodash.startcase';
import formatMessage from 'format-message';
import { IColumn } from 'office-ui-fabric-react';
import { JSONSchema6 } from 'json-schema';
import { DirectionalHint } from 'office-ui-fabric-react';

import { buildDialogOptions, swap, remove, insertAt, DialogOptionsOpts } from '../utils';
import { FormContext } from '../types';

const fieldHeaderTheme = createTheme({
  fonts: {
    medium: {
      fontSize: '24px',
    },
  },
  palette: {
    neutralLighter: '#d0d0d0',
  },
});

interface TableFieldProps<T> {
  additionalColumns?: IColumn[];
  columnHeader?: string;
  formContext: FormContext;
  formData: object[];
  label: string;
  navPrefix: string;
  onChange: (items: T[]) => void;
  renderTitle: (item: T) => string;
  name?: string;
  schema: JSONSchema6;
  dialogOptionsOpts?: DialogOptionsOpts;
}

interface ItemActionsProps<T = any> extends TableFieldProps<T> {
  item: any;
  index?: number;
  newOptions: IContextualMenuItem[];
}

const ItemActions: React.FC<ItemActionsProps> = props => {
  const { navPrefix, index, onChange, formData, formContext, newOptions } = props;

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
        formContext.shellApi.navDown(`.${navPrefix}[${index}]`);
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
      iconProps: { iconName: 'Add' },
      subMenuProps: {
        items: newOptions,
        calloutProps: { calloutMaxHeight: 500 },
        directionalHint: DirectionalHint.rightTopEdge,
      },
    },
  ];

  return <DefaultButton menuProps={{ items: menuItems }} />;
};

export function TableField<T = any>(props: TableFieldProps<T>): JSX.Element {
  const { additionalColumns, columnHeader, dialogOptionsOpts, label, renderTitle } = props;

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
      key: 'column1',
      name: columnHeader || formatMessage('Type'),
      minWidth: 140,
      maxWidth: 200,
      onRender: renderTitle,
    },
    ...(additionalColumns || []),
    {
      key: 'menu',
      name: '',
      minWidth: 140,
      maxWidth: 200,
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
    <div style={{ margin: '30px 0' }}>
      <Separator theme={fieldHeaderTheme} alignContent="start" styles={{ content: { paddingLeft: '0' } }}>
        {props.schema.title || startCase(props.name)}
      </Separator>
      {props.schema.description && (
        <p className={[ColorClassNames.neutralSecondary, FontClassNames.small].join(' ')}>{props.schema.description}</p>
      )}
      <DetailsList
        columns={columns}
        items={items}
        selectionMode={SelectionMode.none}
        styles={{ root: { marginBottom: '20px' } }}
      />
      <PrimaryButton
        menuProps={{
          items: buildDialogOptions({ ...dialogOptionsOpts, onClick: createNewItemAtIndex() }),
          calloutProps: { calloutMaxHeight: 500 },
          directionalHint: DirectionalHint.bottomLeftEdge,
        }}
        split
        type="button"
      >
        {label}
      </PrimaryButton>
    </div>
  );
}

TableField.defaultProps = {
  additionalColumns: [],
  formData: [],
  navPrefix: '',
  onChange: () => {},
};
