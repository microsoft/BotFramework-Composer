// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useRef, useState } from 'react';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import { IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import { FontIcon } from 'office-ui-fabric-react/lib/Icon';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { ISelection, Selection, SelectionMode } from 'office-ui-fabric-react/lib/Selection';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { useId } from '@uifabric/react-hooks';
import formatMessage from 'format-message';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as lazy from './lazy';
import * as model from './model';

export const lazyMap = <T extends unknown>(lazy: lazy.Lazy<T>, selector: (item: T) => JSX.Element): JSX.Element => {
  switch (lazy.local) {
    case 'pending':
      return <Label>{formatMessage('pending')}</Label>;
    case 'started':
      return <Spinner label={formatMessage('started')} />;
    case 'failure':
      return <Label>{lazy.response.message || lazy.local}</Label>;
    case 'success':
      return selector(lazy.item);
  }
};

export const bindSelected = <Remote, T extends model.Thing<Remote>>(
  bind: model.Bind<T, Remote>,
  list: ReadonlyArray<T>,
  item: T | undefined,
  selector: (item: T) => JSX.Element
): JSX.Element => {
  if (item !== undefined) {
    const bound = bind(list, item.remote);
    if (bound !== undefined) {
      return selector(bound);
    }
  }

  return <Fragment />;
};

export type Selector<T extends unknown, R extends unknown> = (item: T) => R;
export type OnRender<T extends unknown> = (item: T) => React.ReactNode;
export type GetKey<T extends unknown> = {
  getKey: (item: T) => string;
};

export const buildColumn = <T extends unknown>(
  key: string,
  selector: Selector<T, string | number | boolean | undefined | null>,
  onRender?: OnRender<T>
): IColumn & GetKey<T> => ({
  key,
  name: key,
  minWidth: 100,
  maxWidth: 300,
  onRender: onRender || (item => <Text>{selector(item)}</Text>),
  getKey: item => JSON.stringify(selector(item)),
});

type Nominal<T, K> = T & { __nominal__: K };
export type ITypedSelection<T> = Nominal<ISelection, T>;

export const useSelection = <T extends unknown>(
  getKey: (item: T) => React.ReactText
): [T | undefined, ITypedSelection<T>] => {
  const [selected, setSelected] = useState<T>();

  const selection = useRef<Selection | undefined>(undefined);

  if (selection.current === undefined) {
    selection.current = new Selection({
      onSelectionChanged: () => {
        const { current } = selection;
        if (current !== undefined) {
          const items = current.getSelection();
          if (items.length > 0) {
            const selected = items[0] as T;
            setSelected(selected);
          } else {
            setSelected(undefined);
          }
        }
      },
      getKey: item => getKey(item as T),
      selectionMode: SelectionMode.single,
    });
  }

  return [selected, (selection.current as unknown) as ITypedSelection<T>];
};

export interface ButtonProps {
  iconName: string;
  content: string;
  onClick: () => void;
}

export const Button: React.FC<ButtonProps> = props => {
  const tooltipId = useId('tooltip');
  return (
    <TooltipHost content={props.content} id={tooltipId}>
      <ActionButton onClick={props.onClick} aria-describedby={tooltipId}>
        <FontIcon iconName={props.iconName} />
      </ActionButton>
    </TooltipHost>
  );
};

// https://www.w3schools.com/howto/howto_js_treeview.asp
export interface TreeItemProps {
  leaf: boolean;
}

export const TreeItem: React.FC<TreeItemProps> = props => {
  const [expanded, setExpanded] = useState(false);

  const style: React.CSSProperties = { cursor: 'pointer', userSelect: 'none' };

  // https://mxstbr.blog/2017/02/react-children-deepdive/
  return (
    <li style={style}>
      <span onClick={() => setExpanded(e => !e)}>{props.leaf ? '.' : expanded ? '-' : '+'}</span>
      {React.Children.map(props.children, (child, index) => {
        switch (index) {
          case 0:
            return child;
          case 1:
            return expanded ? child : null;
          case 2:
            return expanded ? null : child;
          default:
            throw new Error();
        }
      })}
    </li>
  );
};

export const TreeView: React.FC<JSX.IntrinsicAttributes> = props => {
  const style: React.CSSProperties = { listStyleType: 'none' };

  return <ul style={style}>{props.children}</ul>;
};

export interface JsonTreeProps {
  item: unknown;
}

const isObject = (item: unknown): item is object => typeof item === 'object' && item !== null;
const isLeaf = (item: unknown) => !(isObject(item) || Array.isArray(item));

export const JsonTree: React.FC<JsonTreeProps> = props => {
  const { item } = props;

  return (
    <TreeView>
      {isObject(item)
        ? Object.keys(item).map(key => (
            <TreeItem key={key} leaf={isLeaf(item[key])}>
              {key}
              <JsonTree item={item[key]} />
            </TreeItem>
          ))
        : Array.isArray(item)
        ? item.map((value, key) => (
            <TreeItem key={key} leaf={isLeaf(value)}>
              {key}
              <JsonTree item={value} />
            </TreeItem>
          ))
        : JSON.stringify(item)}
    </TreeView>
  );
};
