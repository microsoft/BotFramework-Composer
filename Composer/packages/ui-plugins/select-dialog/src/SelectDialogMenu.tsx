// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo } from 'react';
import {
  IContextualMenuItem,
  ContextualMenuItemType,
  IContextualMenuProps,
} from 'office-ui-fabric-react/lib/ContextualMenu';
import { DefaultButton, IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { SharedColors } from '@uifabric/fluent-theme';
import { FieldLabel } from '@bfc/adaptive-form';
import { FieldProps, DialogInfo } from '@bfc/extension-client';
import { Icons } from '@bfc/shared';
import formatMessage from 'format-message';

export const ADD_DIALOG = 'ADD_DIALOG';

interface SelectDialogMenuProps extends Omit<FieldProps, 'onChange'> {
  dialogs: DialogInfo[];
  topics: DialogInfo[];
  comboboxTitle: string | null;
  onChange: IContextualMenuProps['onItemClick'];
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
  const menuLabel = useMemo(() => {
    if (topics.length > 0) {
      return formatMessage('Select a dialog or topic');
    }

    return formatMessage('Select a dialog');
  }, [topics.length]);

  const dialogItems: IContextualMenuItem[] = dialogs
    .concat(topics)
    // .filter(({ id }) => id !== currentDialogId)
    .map((d) => ({
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

  const items: IContextualMenuItem[] = [
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
  ];

  const selectedLabel = useMemo(() => {
    if (comboboxTitle) {
      return comboboxTitle;
    }

    const selected = dialogItems.find((o) => o.key === value);
    return selected?.text;
  }, [items, value, comboboxTitle]);

  return (
    <React.Fragment>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />
      <DefaultButton
        id={id}
        menuProps={{ ariaLabel: menuLabel, items, onItemClick: onChange, useTargetWidth: true }}
        styles={buttonStyles}
        text={selectedLabel}
        onBlur={() => onBlur?.(id, value)}
        onFocus={(e) => onFocus?.(id, value, e)}
      />
    </React.Fragment>
  );
};

export default SelectDialogMenu;
