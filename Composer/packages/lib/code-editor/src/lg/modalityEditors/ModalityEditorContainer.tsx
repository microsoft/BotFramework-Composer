// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { OpenConfirmModalWithCheckbox } from '@bfc/ui-shared';
import styled from '@emotion/styled';
import { FluentTheme } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { CommandBarButton } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { Dropdown, DropdownMenuItemType, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { OverflowSet } from 'office-ui-fabric-react/lib/OverflowSet';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import React from 'react';

import { ItemWithTooltip } from '../../components/ItemWithTooltip';
import { ModalityType } from '../types';

import { ModalityEditorTitle } from './ModalityEditorTitle';

const Root = styled.div({
  width: '100%',
});

const HeaderContainer = styled.div({
  borderBottom: `1px solid ${FluentTheme.palette.neutralLight}`,
  padding: '8px 0 4px 4px',
  width: '100%',
});

const headerContentStyles = { root: { height: 32 } };

const styles = {
  dropdown: {
    root: {
      ':hover .ms-Dropdown-title, :active .ms-Dropdown-title, :hover .ms-Dropdown-caretDown, :active .ms-Dropdown-caretDown': {
        color: FluentTheme.palette.themeDarker,
      },
      ':focus-within .ms-Dropdown-title, :focus-within .ms-Dropdown-caretDown': {
        color: FluentTheme.palette.accent,
      },
    },
    caretDown: { fontSize: FluentTheme.fonts.xSmall.fontSize, color: FluentTheme.palette.accent },
    dropdownOptionText: { fontSize: FluentTheme.fonts.small.fontSize },
    title: {
      border: 'none',
      fontSize: FluentTheme.fonts.small.fontSize,
      color: FluentTheme.palette.accent,
    },
  },
};

const removeMenuButtonItemProps = { styles: { label: { ...FluentTheme.fonts.small } } };
const dropdownCalloutProps = { styles: { root: { minWidth: 140 } } };

const onRenderOverflowButton = (overflowItems?: IContextualMenuItem[]): JSX.Element => {
  return (
    <CommandBarButton
      menuIconProps={{ iconName: 'MoreVertical' }}
      menuProps={overflowItems && { items: overflowItems }}
      role="menuitem"
      styles={{ root: { padding: '4px 0 4px 0' } }}
      title={formatMessage('Options')}
    />
  );
};

type Props = {
  contentTitle: string;
  contentDescription?: string;
  disableRemoveModality: boolean;
  dropdownOptions?: IDropdownOption[];
  dropdownPrefix?: string;
  menuItems?: IContextualMenuItem[];
  modalityTitle: string;
  modalityType: ModalityType;
  showRemoveModalityPrompt: boolean;
  removeModalityOptionText: string;
  onRemoveModality: (modality: ModalityType, keepReferencedTemplates: boolean) => void;
  onDropdownChange?: (_: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => void;
};

export const ModalityEditorContainer: React.FC<Props> = ({
  children,
  modalityType,
  contentDescription,
  disableRemoveModality,
  dropdownOptions,
  dropdownPrefix = '',
  menuItems = [],
  showRemoveModalityPrompt,
  removeModalityOptionText,
  modalityTitle,
  contentTitle,
  onDropdownChange,
  onRemoveModality,
}) => {
  const renderConfirmDialogContent = React.useCallback((text: React.ReactNode) => <Text>{text}</Text>, []);
  const overflowMenuItems: IContextualMenuItem[] = React.useMemo(
    () => [
      ...menuItems,
      {
        key: 'remove',
        disabled: disableRemoveModality,
        text: removeModalityOptionText,
        itemProps: removeMenuButtonItemProps,
        onClick: () => {
          (async () => {
            if (!showRemoveModalityPrompt) {
              onRemoveModality(modalityType, false);
              return;
            }

            const confirm = await OpenConfirmModalWithCheckbox(
              formatMessage('Removing content from action node'),
              formatMessage(
                'You are about to remove {modalityTitle} content from this action node. Are you sure you want to proceed?',
                { modalityTitle }
              ),
              {
                confirmText: formatMessage('Delete'),
                onRenderContent: renderConfirmDialogContent,
                checkboxProps:
                  modalityType === 'Attachments'
                    ? {
                        kind: 'additionalConfirm',
                        label: formatMessage(
                          'I want to keep the template content in the file, just want to dereference from this response (hint: keep the content if you currently, or plan to re-use in another location)'
                        ),
                        defaultChecked: false,
                      }
                    : undefined,
              }
            );
            if (confirm) {
              onRemoveModality(modalityType, !!confirm.additionalConfirm);
            }
          })();
        },
      },
    ],
    [modalityType, modalityTitle, menuItems, disableRemoveModality, removeModalityOptionText, onRemoveModality]
  );

  const renderTitle = React.useCallback(
    (optionProps?: IDropdownOption[], defaultRender?: (optionProps?: IDropdownOption[]) => JSX.Element | null) => (
      <Text variant="small">
        {dropdownPrefix}
        {defaultRender?.(optionProps)}
      </Text>
    ),
    [dropdownPrefix]
  );

  const renderOption = React.useCallback(
    (
      itemProps?: IDropdownOption,
      defaultRender?: (props?: IDropdownOption) => JSX.Element | null
    ): JSX.Element | null =>
      itemProps?.itemType === DropdownMenuItemType.Header ? (
        <ItemWithTooltip
          itemText={defaultRender?.(itemProps)}
          tooltipId={itemProps?.data?.tooltipId}
          tooltipText={itemProps?.data?.tooltipText}
        />
      ) : (
        defaultRender?.(itemProps) ?? null
      ),
    []
  );

  return (
    <Root>
      <HeaderContainer>
        <Stack horizontal horizontalAlign="space-between" styles={headerContentStyles} verticalAlign="center">
          <ModalityEditorTitle
            helpMessage={contentDescription ?? ''}
            modalityType={modalityType}
            title={contentTitle}
          />
          <Stack horizontal verticalAlign="center">
            {dropdownOptions && onDropdownChange && (
              <Dropdown
                calloutProps={dropdownCalloutProps}
                options={dropdownOptions}
                placeholder={formatMessage('Select input hint')}
                styles={styles.dropdown}
                onChange={onDropdownChange}
                onRenderOption={renderOption}
                onRenderTitle={renderTitle}
              />
            )}
            <OverflowSet
              items={[]}
              overflowItems={overflowMenuItems}
              onRenderItem={() => null}
              onRenderOverflowButton={onRenderOverflowButton}
            />
          </Stack>
        </Stack>
      </HeaderContainer>
      {children}
    </Root>
  );
};
