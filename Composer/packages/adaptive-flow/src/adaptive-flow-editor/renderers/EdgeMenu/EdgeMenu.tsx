// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { ChangeEvent, useContext, useMemo, useRef, useState } from 'react';
import formatMessage from 'format-message';
import { DefinitionSummary } from '@bfc/shared';
import { TooltipHost, DirectionalHint } from 'office-ui-fabric-react/lib/Tooltip';
import { useMenuConfig } from '@bfc/extension-client';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import debounce from 'lodash/debounce';
import Fuse from 'fuse.js';
import startCase from 'lodash/startCase';

// TODO: leak of visual-sdk domain (EdgeAddButtonSize)

import { EdgeAddButtonSize } from '../../../adaptive-flow-renderer/constants/ElementSizes';
import { NodeRendererContext } from '../../contexts/NodeRendererContext';
import { SelectionContext } from '../../contexts/SelectionContext';
import { SelfHostContext } from '../../contexts/SelfHostContext';
import { AttrNames } from '../../constants/ElementAttributes';
import { MenuTypes } from '../../constants/MenuTypes';
import { ObiColors } from '../../../adaptive-flow-renderer/constants/ElementColors';
import { IconMenu } from '../../components/IconMenu';
import { NodeEventTypes } from '../../../adaptive-flow-renderer/constants/NodeEventTypes';

import { createActionMenu, createDivider, createPasteButtonItem, createSearchBarItem } from './createSchemaMenu';

interface EdgeMenuProps {
  id: string;
  onClick: (item: string | null) => void;
}

export const EdgeMenu: React.FC<EdgeMenuProps> = ({ id, onClick }) => {
  const { clipboardActions, customSchemas, externalEvent, onCompleteExternalEvent } = useContext(NodeRendererContext);
  const selfHosted = useContext(SelfHostContext);
  const { selectedIds } = useContext(SelectionContext);
  const nodeSelected = selectedIds.includes(`${id}${MenuTypes.EdgeMenu}`);
  const declareElementAttributes = (id: string) => {
    return {
      [AttrNames.SelectableElement]: true,
      [AttrNames.EdgeMenuElement]: true,
      [AttrNames.SelectedId]: `${id}${MenuTypes.EdgeMenu}`,
    };
  };

  const insertMode = externalEvent?.eventType === NodeEventTypes.Insert && externalEvent.eventData?.command;

  const [menuSelected, setMenuSelected] = useState<boolean>(false);
  let boxShadow = '0px 2px 8px rgba(0, 0, 0, 0.1)';
  boxShadow += insertMode
    ? `,0 0 10px 3px ${ObiColors.AzureBlue}`
    : menuSelected
    ? `,0 0 0 2px ${ObiColors.AzureBlue}`
    : nodeSelected
    ? `, 0 0 0 2px ${ObiColors.Black}`
    : '';

  const handleMenuShow = (menuSelected) => {
    if (insertMode && menuSelected) {
      onCompleteExternalEvent();
      externalEvent?.eventData?.kind && onClick(externalEvent.eventData.kind);
    } else {
      setMenuSelected(menuSelected);
    }
  };

  const [searchValue, setSearchValue] = useState('');

  const debounceSetSearchValue = useRef(
    debounce<(e?: ChangeEvent<HTMLInputElement>, value?: string) => void>(
      (_, value) => setSearchValue(value || ''),
      300
    )
  ).current;

  const options = {
    isSelfHosted: selfHosted,
    enablePaste: Array.isArray(clipboardActions) && !!clipboardActions.length,
  };

  const handleClick = (item) => {
    if (!item) return;
    onClick(item.key);
  };

  const { menuSchema, forceDisabledActions } = useMenuConfig();
  const menuItems = useMemo(
    () =>
      createActionMenu(
        handleClick,
        options,
        forceDisabledActions,
        menuSchema,
        // Custom Action 'oneOf' arrays from schema file
        customSchemas
          .map((x) => x.oneOf)
          .filter((oneOf) => Array.isArray(oneOf) && oneOf.length) as DefinitionSummary[][]
      ),
    [forceDisabledActions, menuSchema, options]
  );

  const subMenuItems = useMemo(() => {
    return menuItems.reduce((acc, item) => {
      if (item.subMenuProps && item.subMenuProps.items) {
        return [...acc, ...item.subMenuProps.items];
      }
      return [...acc, item];
    }, [] as IContextualMenuItem[]);
  }, [menuItems]);

  const fuse = useMemo(
    () =>
      new Fuse(subMenuItems, {
        includeScore: true,
        includeMatches: true,
        isCaseSensitive: false,
        threshold: 0.2,
        useExtendedSearch: true,
        findAllMatches: true,
        keys: ['name', 'key'],
      }),
    [subMenuItems]
  );

  const items = useMemo(() => {
    const items: IContextualMenuItem[] =
      searchValue && searchValue.length > 2 ? fuse.search(searchValue).map(({ item }) => item) : menuItems;

    // paste button
    const pasteButtonDisabled = !options.enablePaste;
    const pasteButton = createPasteButtonItem(items.length, pasteButtonDisabled, handleClick);

    // search bar
    const searchBar = createSearchBarItem(debounceSetSearchValue);

    items.unshift(pasteButton, createDivider(), searchBar, createDivider());
    return items;
  }, [searchValue, subMenuItems, menuItems, options.enablePaste]);

  const moreLabel = !insertMode
    ? formatMessage('Add')
    : formatMessage('Add “{actionType}” action here.', {
        actionType: startCase(externalEvent?.eventData?.command)
          .split(' ')
          .map((c, i) => (i === 0 ? c : c.toLocaleLowerCase()))
          .join(' '),
      });

  return (
    <div
      style={{
        width: EdgeAddButtonSize.width,
        height: EdgeAddButtonSize.height,
        borderRadius: '8px',
        backdropFilter: 'white',
        boxShadow: boxShadow,
        overflow: 'hidden',
        background: 'white',
      }}
      {...declareElementAttributes(id)}
    >
      <TooltipHost content={moreLabel} directionalHint={DirectionalHint.leftCenter}>
        <IconMenu
          handleMenuShow={handleMenuShow}
          iconName="Add"
          iconSize={7}
          iconStyles={{
            color: '#005CE6',
            selectors: {
              ':focus': {
                outline: 'none',
                selectors: {
                  '::after': {
                    outline: 'none !important',
                  },
                },
              },
            },
          }}
          label={moreLabel}
          menuItems={items}
          nodeSelected={nodeSelected}
        />
      </TooltipHost>
    </div>
  );
};
