// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ClassNames } from '@emotion/core';
import React, { useMemo, useCallback, useState } from 'react';
import {
  IContextualMenuItem,
  ContextualMenuItemType,
  IContextualMenuListProps,
} from 'office-ui-fabric-react/lib/ContextualMenu';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { SearchBox, ISearchBoxStyles } from 'office-ui-fabric-react/lib/SearchBox';
import { DefaultButton, IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { IRenderFunction, getId } from 'office-ui-fabric-react/lib/Utilities';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import { FieldLabel } from '@bfc/adaptive-form';
import { FieldProps, DialogInfo } from '@bfc/extension-client';
import { Icons } from '@bfc/shared';
import formatMessage from 'format-message';

export const ADD_DIALOG = 'ADD_DIALOG';

const MAX_SIZE_BEFORE_FILTER = 10;
interface SelectDialogMenuProps extends Omit<FieldProps, 'onChange'> {
  dialogs: DialogInfo[];
  topics: DialogInfo[];
  comboboxTitle: string | null;
  onChange: (item?: IContextualMenuItem) => void;
}

const getIconName = (item: DialogInfo) => {
  if (item.isTopic) {
    const isSystemTopic = item.content?.isSystemTopic;
    return isSystemTopic ? Icons.SYSTEM_TOPIC : Icons.TOPIC;
  } else {
    return Icons.DIALOG;
  }
};

const buttonStyles: IButtonStyles = {
  root: { outline: '1px solid transparent', padding: '0 8px', textAlign: 'left' },
  rootFocused: {
    outlineWidth: '0px',
    border: `1px solid ${SharedColors.cyanBlue10}`,
    selectors: {
      '::after': {
        content: '',
        // need to use !important to override global focus class specificity
        border: `1px solid ${SharedColors.cyanBlue10} !important`,
        outline: 'none !important',
        inset: '0 !important',
      },
    },
  },
  rootHovered: { backgroundColor: 'initial' },
  rootPressed: {
    backgroundColor: 'initial',
    outlineWidth: '0px',
    border: `1px solid ${SharedColors.cyanBlue10}`,
    selectors: {
      '::after': {
        content: '',
        // need to use !important to override global focus class specificity
        border: `1px solid ${SharedColors.cyanBlue10} !important`,
        outline: 'none !important',
        inset: '0 !important',
      },
    },
  },
  rootChecked: { backgroundColor: 'initial' },
  rootExpanded: { backgroundColor: 'initial' },
  rootExpandedHovered: { backgroundColor: 'initial' },
  flexContainer: { justifyContent: 'space-between' },
  label: { margin: '0', fontWeight: 'normal' },
};

const searchFieldStyles: ISearchBoxStyles = {
  root: {
    borderColor: 'transparent',
    borderRadius: '0 !important',
    selectors: {
      '::after': {
        borderRadius: '0',
      },
    },
  },
};

export const SelectDialogMenu: React.FC<SelectDialogMenuProps> = (props) => {
  const {
    comboboxTitle,
    description,
    id,
    label,
    value = '',
    required,
    uiOptions,
    onBlur,
    onChange,
    onFocus,
    dialogs,
    topics,
  } = props;
  const menuId = useMemo(() => getId('select-dialog-menu'), []);
  const shouldShowFilter = useMemo(() => {
    return dialogs.length + topics.length > MAX_SIZE_BEFORE_FILTER;
  }, [dialogs.length, topics.length]);

  const menuLabel = useMemo(() => {
    if (topics.length > 0) {
      return formatMessage('Select a dialog or topic');
    }

    return formatMessage('Select a dialog');
  }, [topics.length]);

  const allItems: IContextualMenuItem[] = useMemo(() => {
    return dialogs.concat(topics).map((d) => ({
      key: d.isTopic ? d.content?.id : d.id,
      text: d.displayName,
      isSelected: value === d.displayName,
      data: d,
      iconProps: {
        iconName: getIconName(d),
        styles: {
          root: {
            color: 'inherit',
          },
        },
      },
    }));
  }, [dialogs.length, topics.length]);
  const [dialogItems, setDialogItems] = useState(allItems);

  const items = useMemo<IContextualMenuItem[]>(
    () => [
      {
        key: 'dialogs',
        itemType: ContextualMenuItemType.Section,
        sectionProps: {
          items: dialogItems,
        },
      },
      {
        key: 'actions',
        itemType: ContextualMenuItemType.Section,
        sectionProps: {
          topDivider: true,
          items: [
            {
              key: 'expression',
              text: formatMessage('Write an expression'),
              iconProps: {
                iconName: Icons.EXPRESSION,
              },
            },
            {
              key: ADD_DIALOG,
              text: formatMessage('Create a new dialog'),
              iconProps: {
                iconName: 'Add',
              },
            },
          ],
        },
      },
    ],
    [dialogItems, shouldShowFilter]
  );

  const filterDialogs = useCallback(
    (e, newVal?: string) => {
      if (!newVal) {
        setDialogItems(allItems);
      }

      setDialogItems(allItems.filter((item) => item.text?.toLowerCase().includes(newVal?.toLowerCase() ?? '')));
    },
    [allItems]
  );

  const selectedLabel = useMemo(() => {
    if (comboboxTitle) {
      return comboboxTitle;
    }

    const selected = allItems.find((o) => o.key === value);
    return selected?.text;
  }, [items, value, comboboxTitle]);

  const filterPlaceholder = useMemo(() => {
    if (topics.length > 0) {
      return formatMessage('Find dialogs or topics');
    }

    return formatMessage('Find dialogs');
  }, [topics.length]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      const menu = document.getElementById(menuId);

      if (menu) {
        const items = menu.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
        items[0].focus();
        e.stopPropagation();
      }
    }
  }, []);

  const onRenderMenuList = useCallback(
    (menuListProps?: IContextualMenuListProps, defaultRender?: IRenderFunction<IContextualMenuListProps>) => {
      return (
        <Stack>
          <SearchBox
            componentRef={(el) => el?.focus()}
            placeholder={filterPlaceholder}
            styles={searchFieldStyles}
            onAbort={() => setDialogItems(allItems)}
            onChange={filterDialogs}
            onKeyDown={handleKeyDown}
          />
          <div style={{ height: '1px', display: 'block', backgroundColor: NeutralColors.gray30 }} />
          <Stack>{defaultRender?.(menuListProps)}</Stack>
        </Stack>
      );
    },
    [allItems, filterDialogs]
  );

  const handleItemClick = useCallback(
    (e, item?: IContextualMenuItem) => {
      setDialogItems(allItems);
      onChange(item);
    },
    [allItems]
  );

  return (
    <React.Fragment>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />
      <ClassNames>
        {({ css }) => (
          <DefaultButton
            id={id}
            menuProps={{
              id: menuId,
              ariaLabel: menuLabel,
              items,
              onItemClick: handleItemClick,
              useTargetWidth: true,
              onRenderMenuList: shouldShowFilter ? onRenderMenuList : undefined,
              // send focus to the search box when present
              shouldFocusOnMount: !shouldShowFilter,
              className: css`
                .ms-ContextualMenu-list .ms-ContextualMenu-list {
                  // 10 items @ 36px each + 2px padding
                  max-height: 362px;
                  overflow-y: scroll;
                }
              `,
            }}
            styles={buttonStyles}
            text={selectedLabel || ' '}
            onBlur={() => onBlur?.(id, value)}
            onFocus={(e) => onFocus?.(id, value, e)}
          />
        )}
      </ClassNames>
    </React.Fragment>
  );
};

export default SelectDialogMenu;
