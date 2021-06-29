// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  CommandButton,
  IBaseButtonProps,
  IButtonProps,
  IButtonStyles,
  IconButton,
} from 'office-ui-fabric-react/lib/Button';
import { getTheme } from 'office-ui-fabric-react/lib/Styling';
import styled from '@emotion/styled';
import formatMessage from 'format-message';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { ILabelStyleProps, ILabelStyles, Label } from 'office-ui-fabric-react/lib/Label';
import { SelectionZone } from 'office-ui-fabric-react/lib/Selection';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';
import { ITextField, ITextFieldProps, ITextFieldStyles, TextField } from 'office-ui-fabric-react/lib/TextField';
import { classNamesFunction, getId, IStyleFunctionOrObject, SelectionMode } from 'office-ui-fabric-react/lib/Utilities';
import { ICalloutPositionedInfo } from 'office-ui-fabric-react/lib/utilities/positioning';
import * as React from 'react';

import { SearchableDropdownTextField, SearchableDropdownTextFieldProps } from './SearchableDropdownTextField';
import { useSelection } from './hooks/useSelection';
import { SearchStrategy } from './searchStrategies';

const noop = () => {};

export const KeyCodes = {
  Escape: 'Escape',
  ArrowRight: 'ArrowRight',
  ArrowLeft: 'ArrowLeft',
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  Enter: 'Enter',
  Backspace: 'Backspace',
  Delete: 'Delete',
  OpenBraces: '{',
  CloseBraces: '}',
  Tab: 'Tab',
};

export type CreationProps = {
  creationTextFieldProps?: ITextFieldProps;
  creationItem?: IContextualMenuItem;
};

export type SearchableDropdownProps = {
  /**
   * The value set to the dropdown. This is
   * different than the value that is displayed
   * in the text field. It is the value that is
   * set automatically when the menu is closed.
   */
  value: string;

  /**
   * 'Create New' item will be shown in the options
   *  when selected, a TextField will be shown to enter
   *  the name of the new option.
   */
  allowCreation?: boolean;

  /**
   * The items to display in the dropdown.
   */
  items?: IContextualMenuItem[];

  onNoItemsContent?: (query: string) => IContextualMenuItem[];

  /**
   * A flag to indicate whether the dropdown
   * is in a loading state or not.
   *
   * @default false
   */
  isLoading?: boolean;

  /**
   * Whether to accept submission of text values
   * that don't exist in the passed items.
   */
  allowNonExistingItems?: boolean;

  /**
   * Additional styles and classes to pass to the
   * text field.
   */
  textFieldProps?: Pick<
    SearchableDropdownTextFieldProps,
    | 'styles'
    | 'className'
    | 'required'
    | 'disabled'
    | 'label'
    | 'onRenderLabel'
    | 'description'
    | 'errorMessage'
    | 'placeholder'
    | 'autoFocus'
    | 'aria-labelledby'
    | 'ariaLabel'
    | 'data-automation-id'
    | 'underlined'
    | 'onChange'
  >;
  creationProps?: CreationProps;
  /**
   * Styles to apply to the root element of
   * the search dropdown
   */
  className?: string;

  /**
   * The placeholder to show when there are no items
   * to display.
   */
  emptyStatePlaceholder?: string;

  /**
   * The dropdown maximum height. Used in calculations
   * when controlling scrolling behavior of items.
   */
  maxDropdownHeight?: number;

  /**
   * Fired when the user clicks on clear item button.
   */
  onClear?: () => void;

  /**
   * Fired when the user clicks on an item or
   * presses the Enter key.
   */
  onSubmit: (item: IContextualMenuItem) => void;
};

const { fonts, palette } = getTheme();

const dropdownTheme = {
  selectedItemBackgroundColor: palette.neutralLighter,
  suffixBackgroundColor: palette.white,
  iconFontSize: fonts.small.fontSize,
  chevronColor: palette.neutralSecondary,
  secondaryTextColor: palette.neutralSecondary,
};

const Root = styled.div`
  position: relative;
`;

const CreateNewOptionDivider = styled.div`
  border-top: 1px solid #edebe9;
`;

const BlockCommandButton = styled(CommandButton)`
  display: block;
`;

const IconContainer = styled(Stack)`
  height: 100%;
  padding: 0;
`;

const SecondaryText = styled(Text)`
  color: ${palette.neutralSecondary};
`;

const textFieldButtonStyles = classNamesFunction<IButtonProps, IButtonStyles>()({
  root: { height: '100%', width: '28px' },
  icon: { fontSize: dropdownTheme.iconFontSize, color: dropdownTheme.chevronColor },
});

const textFieldStyles = classNamesFunction<ITextFieldProps, ITextFieldStyles>()({
  suffix: { height: '100%', padding: 0, backgroundColor: dropdownTheme.suffixBackgroundColor },
});

const underlineTextFieldLabelStyles = classNamesFunction<ILabelStyleProps, ILabelStyles>()({
  root: { marginLeft: '8px' },
});

/**
 * Generates styles for a list item based on its
 * current state.
 *
 * @param isSelected Whether the item is selected or not.
 */
const getListItemClassName = (isSelected: boolean, isCreateNew = false) => {
  const styles: IStyleFunctionOrObject<IButtonProps, IButtonStyles> = {};

  styles.root = { width: '100%', textAlign: 'left' };
  styles.rootHovered = { backgroundColor: dropdownTheme.selectedItemBackgroundColor };
  styles.textContainer = { textAlign: 'left' };

  if (isSelected) {
    styles.root.backgroundColor = dropdownTheme.selectedItemBackgroundColor;
  }
  if (isCreateNew) {
    styles.root.color = palette.themePrimary;
  }

  return classNamesFunction<IButtonProps, IButtonStyles>()(styles);
};

/**
 * Increments or decrements the iterator to cycle
 * through the dropdown. Ensures that the iterator
 * rotates whenever it reaches the beginning or end
 * of a list.
 *
 * @param iterator The current value of the iterator
 * @param direction The direction to move the iterator in.
 * @param itemsLength The length of the list being iterated.
 * @returns A new value for the iterator to move in.
 */
const getNextIteratorValue = (iterator: number, direction: 'forward' | 'backward', itemsLength: number) => {
  if (direction === 'forward' && iterator < itemsLength - 1) {
    return iterator + 1;
  }

  if (direction === 'forward') {
    return 0;
  }

  if (direction === 'backward' && iterator > 0) {
    return iterator - 1;
  }

  return itemsLength - 1;
};

/**
 * Gets the next item that can be selected (is not disabled, etc.)
 *
 * @param items The array of items to search in.
 * @param selectedIndex The index of the current selected item.
 * @param direction The direction to search in.
 * @returns The item found or undefined.
 */
const getNextSelectableItem = (
  items: IContextualMenuItem[],
  selectedIndex: number,
  direction: 'forward' | 'backward'
) => {
  if (!items.length) {
    return undefined;
  }

  if (items.every((i) => i.disabled)) {
    return undefined;
  }

  let iterator = selectedIndex || 0;

  do {
    iterator = getNextIteratorValue(iterator, direction, items.length);
  } while (items[iterator].disabled === true);

  return items[iterator];
};

/**
 * Checks if a dropdown item is hidden in a scrollable
 * list panel.
 *
 * @example
 * Legend:
 * - (It): Item top corner
 * - (Ib): Item bottom corner
 * - (Pt): Panel top corner
 * - (Pb): Panel bottom corner
 *
 * Case (1): Completely hidden top: (Ib <= Pt)
 *
 *     It
 *     +-------------------+
 *     |                   |
 *     +-------------------+
 *     Ib
 * Pt
 * +----------------------------+
 * |                            |
 * |                            |
 * |                            |
 * +----------------------------+
 *
 *
 * Case (2): Completely hidden bottom: (Pb <= It)
 *
 * Pt
 * +----------------------------+
 * |                            |
 * |                            |
 * |                            |
 * +----------------------------+
 * Pb
 *     It
 *     +-------------------+
 *     |                   |
 *     +-------------------+
 *     Ib
 *
 * @param panel The panel that contains the list of items
 * @param item The item under consideration.
 * @returns True if an item is completely as described above
 * and false otherwise.
 */
const isItemHidden = (panel: Partial<ClientRect>, item: Partial<ClientRect>) => {
  if (!item || !panel) {
    return;
  }

  if (item.bottom <= panel.top) {
    return true;
  }

  if (panel.bottom <= item.top) {
    return true;
  }

  return false;
};

/**
 * Checks if a dropdown item is  partially hidden in a
 * scrollable list panel.
 *
 * @example
 * Legend:
 * - (It): Item top corner
 * - (Ib): Item bottom corner
 * - (Pt): Panel top corner
 * - (Pb): Panel bottom corner
 *
 * Case (1): Partial top overlap: (It < Pt and Pt < Ib)
 *
 *     It
 *     +-------------------+
 * Pt  |                   |
 * +----------------------------+
 * |   |                   |    |
 * |   +-------------------+    |
 * |   Ib                       |
 * |                            |
 * +----------------------------+
 *
 *
 * Case (2): Partially bottom overlap: (It < Pb and Pb < Ib)
 *
 * Pt
 * +----------------------------+
 * |                            |
 * |   It                       |
 * |   +-------------------+    |
 * |   |                   |    |
 * +----------------------------+
 * Pb  |                   |
 *     +-------------------+
 *     Ib
 *
 * @param panel The panel that contains the list of items
 * @param item The item under consideration.
 * @returns True if partial overlap as described above and false otherwise.
 */
const isItemPartiallyHidden = (panel: Partial<ClientRect>, item: Partial<ClientRect>) => {
  if (!item || !panel) {
    return;
  }

  if (item.top < panel.top && panel.top < item.bottom) {
    return true;
  }

  if (item.top < panel.bottom && panel.bottom < item.bottom) {
    return true;
  }

  return false;
};

/**
 * Renders a dropdown with a text field that filters
 * the items in the dropdown.
 */
export const SearchableDropdown = (props: SearchableDropdownProps) => {
  const {
    value,
    onClear,
    onSubmit,
    items = [],
    textFieldProps,
    onNoItemsContent,
    isLoading = false,
    emptyStatePlaceholder,
    maxDropdownHeight = 300,
    className: rootClassName,
    allowNonExistingItems = false,
    allowCreation,
    creationProps: { creationTextFieldProps, creationItem } = {},
  } = props;

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const panelIdRef = React.useRef(getId());
  const fieldRef = React.useRef<ITextField>();
  const rootRef = React.useRef<HTMLDivElement>();
  const calloutPositionRef = React.useRef<ICalloutPositionedInfo>();
  const listRef = React.useRef<HTMLDivElement>();
  const itemsRef = React.useRef<React.RefObject<HTMLDivElement>[]>([]);
  const isScrollIdle = React.useRef(true);
  const scrollIdleTimeoutId = React.useRef<NodeJS.Timeout>();
  const { selection } = useSelection<IContextualMenuItem>(SelectionMode.single);
  let filteredItems = SearchStrategy.substringSearchStrategy(items, query, 'text');
  const labelIdRef = React.useRef(getId());

  if (filteredItems.length === 0 && onNoItemsContent) {
    filteredItems = filteredItems.concat(onNoItemsContent(query));
  }

  /**
   * This is the only way we can have the callout appear directly
   * below the text field even if an error message or a description
   * is displayed under the text field.
   */
  const calloutTarget = rootRef.current?.querySelector('.ms-TextField-wrapper');

  const createNewItem = React.useMemo(() => creationItem ?? { key: 'CREATE_NEW', text: formatMessage('Create New') }, [
    creationItem,
  ]);

  if (allowCreation) {
    filteredItems.unshift(createNewItem);
  }

  React.useEffect(() => {
    setQuery(value);
  }, [value]);

  React.useEffect(() => {
    itemsRef.current = filteredItems.map(() => React.createRef());
    selection.setItems(filteredItems, false);
  }, [filteredItems.length]);

  React.useEffect(() => {
    if (isMenuOpen) {
      fieldRef.current.select();
    }
  }, [isMenuOpen]);

  React.useEffect(() => {
    if (isMenuOpen) {
      if (!selection.isIndexSelected(0)) {
        selection.setIndexSelected(0, true, true);
      }
    } else {
      selection.setAllSelected(false);
    }
  }, [isMenuOpen, filteredItems.length]);

  /**
   * Gets the coordinates of the callout panel. This is a temporary
   * solution until Office Fabric exposes the bottom position or
   * the height of the placed callout.
   */
  const getPanelRect = (): Partial<ClientRect> => {
    const panelHeight =
      listRef.current?.clientHeight > maxDropdownHeight ? maxDropdownHeight : listRef.current?.clientHeight;
    const top = calloutPositionRef.current?.elementPosition.top || calloutPositionRef.current?.elementPosition.bottom;
    const bottom = top + panelHeight;

    return { top, bottom };
  };

  /**
   * Reacts to the item being clicked.
   *
   * @param item The item that was clicked in the dropdown.
   * @param event The event that was fired by the click.
   */
  const onItemClick = (item: IContextualMenuItem, event: Parameters<IBaseButtonProps['onClick']>['0']): void => {
    if (!isScrollIdle) {
      return;
    }

    if (item.onClick) {
      item.onClick();
    }

    onSubmit(item);
    setQuery(item.text);
    setIsMenuOpen(false);
    event.stopPropagation();
  };

  /**
   * Whenever the mouse hovers over an item, it should:
   *
   * - Ensure that it is selected. Note the seemingly
   *   redundant check. This is a bug in Office Fabric
   *   where setting a key to be selected when it was
   *   already selected actually deselects it.
   *
   * @param item The item that the mouse hovered over.
   */
  const onItemMouseOver = (item: IContextualMenuItem, index: number): void => {
    if (!isScrollIdle) {
      return;
    }

    const itemDiv = itemsRef.current[index].current;

    if (!selection.isKeySelected(item.key)) {
      selection.setKeySelected(item.key, true, false);
    }

    if (isItemPartiallyHidden(getPanelRect(), itemDiv?.getBoundingClientRect())) {
      itemDiv.scrollIntoView({ block: 'nearest' });
    }
  };

  /**
   * Whenever the mouse leaves an item, it should:
   *
   * - Ensure that it is no longer selected.
   *
   * @param item The item that the mouse left.
   */
  const onItemMouseLeave = (item: IContextualMenuItem): void => {
    if (!isScrollIdle) {
      return;
    }

    selection.setKeySelected(item.key, false, false);
  };

  const onSubmitInput = (selectedIndex: number) => {
    /**
     * if there is no exact match to the submitted query either
     *     ---> populate the text as is if non existing items allowed.
     *     ---> submit first partial match item if exists.
     */
    if (!selectedIndex) {
      if (allowNonExistingItems) {
        onSubmit({ key: undefined, text: query });
      } else if (filteredItems.length > 0) {
        setIsMenuOpen(false);
        onSubmit(filteredItems[0]);
      }
    } else {
      onSubmit(filteredItems[selectedIndex]);
      setQuery(filteredItems[selectedIndex].text);
      setIsMenuOpen(false);
    }
  };

  /**
   * Controls all keyboard interactions with the text field:
   *
   * @param event The event that triggered this function.
   */
  const onFieldKeyDown = (event: React.KeyboardEvent): void => {
    const selectedIndex = selection.getSelectedIndices()[0];

    /**
     * Ensures that key right and left strokes are propagated to the
     * FocusZone that is wrapping the text field to be able to
     * cycle focus between input field and the action icons.
     */
    if (event.key !== KeyCodes.ArrowRight && event.key !== KeyCodes.ArrowLeft) {
      event.stopPropagation();
    }

    if (event.key === KeyCodes.Escape) {
      setIsMenuOpen(false);

      return;
    }

    if (event.key === KeyCodes.Tab) {
      if (!isMenuOpen) {
        return;
      }

      if (selectedIndex === undefined && !allowNonExistingItems) {
        event.preventDefault();

        return;
      }
    }

    if (event.key === KeyCodes.Enter || event.key === KeyCodes.Tab) {
      onSubmitInput(selectedIndex);

      return;
    }

    if (event.key === KeyCodes.ArrowDown || event.key === KeyCodes.ArrowUp) {
      const direction = event.key === KeyCodes.ArrowDown ? 'forward' : 'backward';
      const item = getNextSelectableItem(filteredItems, selection.getSelectedIndices()[0], direction);

      if (item && !selection.isKeySelected(item.key)) {
        selection.setKeySelected(item.key, true, true);

        const currentItemDiv = itemsRef.current[selection.getSelectedIndices()[0]].current;
        const itemRect = currentItemDiv?.getBoundingClientRect();
        const panelRect = getPanelRect();

        if (isItemPartiallyHidden(panelRect, itemRect) || isItemHidden(panelRect, itemRect)) {
          currentItemDiv.scrollIntoView({ block: 'nearest' });
        }
      }

      event.preventDefault();

      return;
    }

    setIsMenuOpen(true);
  };

  /**
   * Scroll handler for the callout to make sure the mouse events
   * for updating focus are not interacting during scroll
   */
  const onScroll = (): void => {
    if (!isScrollIdle && scrollIdleTimeoutId !== undefined) {
      clearTimeout(scrollIdleTimeoutId.current);
      scrollIdleTimeoutId.current = undefined;
    } else {
      isScrollIdle.current = false;
    }

    scrollIdleTimeoutId.current = setTimeout(() => (isScrollIdle.current = true), 250);
  };

  /**
   * Handler for the clear button click.
   */
  const onClearHandler = () => {
    setQuery('');

    if (onClear) {
      onClear();
    }
  };

  /**
   * Renders text field icons based on the state of the field:
   *
   * - Always render a chevron arrow toggle button.
   * - If there is a query, render a clear icon.
   */
  const onRenderTextFieldSuffix = (fieldProps: ITextFieldProps) => {
    const dropdownExpandButton = (
      <IconButton
        aria-controls={panelIdRef.current}
        aria-expanded={isMenuOpen}
        ariaLabel={formatMessage('Chevron down')}
        disabled={fieldProps.disabled}
        iconProps={{ iconName: 'ChevronDown' }}
        styles={textFieldButtonStyles}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      />
    );

    const clearButton = (
      <IconButton
        ariaLabel={formatMessage('Clear')}
        disabled={fieldProps.disabled}
        iconProps={{ iconName: 'Clear' }}
        styles={textFieldButtonStyles}
        onClick={onClearHandler}
      />
    );

    if (query) {
      return (
        <IconContainer horizontal horizontalAlign="center" verticalAlign="center">
          {clearButton}
          {dropdownExpandButton}
        </IconContainer>
      );
    } else {
      return dropdownExpandButton;
    }
  };

  /**
   * Renders the text field while ensuring that the
   * label id is exposed for aria labelled by to
   * utilize it.
   */
  const onRenderTextFieldLabel = () => {
    if (!textFieldProps || !textFieldProps.label) {
      return;
    }

    return (
      <Label
        id={labelIdRef.current}
        required={textFieldProps.required}
        styles={textFieldProps?.underlined && underlineTextFieldLabelStyles}
      >
        {textFieldProps.label}
      </Label>
    );
  };

  const onInputChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue: string) => {
    setQuery(newValue);

    if (textFieldProps?.onChange) {
      textFieldProps.onChange(event, newValue);
    }
  };

  const onRenderItem = (item: IContextualMenuItem) => {
    return item.onRender ? (
      item.onRender(item, noop)
    ) : (
      <Stack horizontal verticalFill tokens={{ childrenGap: 8 }} verticalAlign="center">
        <Text>{item.text}</Text>
        {item.secondaryText && <SecondaryText variant="xSmall">{item.secondaryText}</SecondaryText>}
      </Stack>
    );
  };

  const onRenderItems = () => {
    if (isLoading) {
      return (
        <BlockCommandButton disabled>
          <Stack horizontal tokens={{ childrenGap: 10 }} verticalAlign="center">
            <Spinner size={SpinnerSize.small}></Spinner>
            <Text>{formatMessage('Loading ...')}</Text>
          </Stack>
        </BlockCommandButton>
      );
    }

    if (!filteredItems.length) {
      return (
        !textFieldProps?.errorMessage && (
          <BlockCommandButton disabled role="alert" text={emptyStatePlaceholder || formatMessage('No items to show')} />
        )
      );
    }

    return filteredItems.map((item, index) => (
      <div key={item.key} ref={itemsRef.current[index]}>
        <CommandButton
          key={item.key}
          aria-selected={selection.isKeySelected(item.key)}
          data-selection-index={index}
          disabled={item.disabled}
          iconProps={{ iconName: item.iconProps?.iconName }}
          role="option"
          styles={getListItemClassName(selection.isKeySelected(item.key), item.key === createNewItem.key)}
          tabIndex={-1}
          title={item.text}
          onClick={(event) => onItemClick(item, event)}
          onMouseLeave={() => onItemMouseLeave(item)}
          onMouseOver={() => onItemMouseOver(item, index)}
        >
          {onRenderItem(item)}
        </CommandButton>
        {allowCreation && item.key === creationItem.key && <CreateNewOptionDivider />}
      </div>
    ));
  };

  return (
    <Root ref={rootRef} className={rootClassName}>
      {!textFieldProps?.label && (
        <span data-automation-id="hiddenLabel" id={labelIdRef.current} style={{ display: 'none' }}>
          {formatMessage('Choose item from list')}
        </span>
      )}

      <FocusZone direction={FocusZoneDirection.horizontal}>
        <SearchableDropdownTextField
          ref={fieldRef}
          aria-labelledby={labelIdRef.current}
          value={query}
          onRenderLabel={onRenderTextFieldLabel}
          {...textFieldProps}
          ariaLabel={textFieldProps?.placeholder || formatMessage('Type a value here ...')}
          placeholder={isLoading ? formatMessage('Loading ...') : textFieldProps?.placeholder}
          styles={mergeStyleSets(textFieldStyles, textFieldProps?.styles)}
          onChange={onInputChange}
          onFocus={() => setIsMenuOpen(true)}
          onKeyDown={onFieldKeyDown}
          onRenderSuffix={onRenderTextFieldSuffix}
        />
      </FocusZone>

      {isMenuOpen && (
        <Callout
          calloutMaxHeight={maxDropdownHeight}
          calloutWidth={rootRef.current?.clientWidth}
          directionalHint={DirectionalHint.bottomLeftEdge}
          doNotLayer={false}
          hidden={!isMenuOpen}
          id={panelIdRef.current}
          isBeakVisible={false}
          target={calloutTarget}
          onDismiss={() => setIsMenuOpen(false)}
          onPositioned={(positionInfo) => (calloutPositionRef.current = positionInfo)}
          onScroll={onScroll}
        >
          <SelectionZone selection={selection}>
            <div ref={listRef} aria-labelledby={labelIdRef.current} role="listbox">
              {onRenderItems()}
            </div>
          </SelectionZone>
        </Callout>
      )}
      {allowCreation && value === createNewItem.text && (
        <div>
          <TextField
            {...creationTextFieldProps}
            autoComplete="off"
            deferredValidationTime={300}
            styles={mergeStyleSets(textFieldStyles, textFieldProps?.styles)}
          />
        </div>
      )}
    </Root>
  );
};
