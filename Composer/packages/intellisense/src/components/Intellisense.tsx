// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { useLanguageServer } from '../hooks/useLanguageServer';
import { checkIsOutside } from '../utils/uiUtils';

import { CompletionList } from './CompletionList';

export const Intellisense = React.memo(
  (props: {
    url: string;
    scopes: string[];
    projectId?: string;
    id: string;
    value?: any;
    focused?: boolean;
    completionListOverrideContainerElements?: HTMLDivElement[];
    completionListOverrideResolver?: (value: any) => JSX.Element | null;
    onChange: (newValue: string) => void;
    onBlur?: (id: string) => void;
    children: (renderProps: {
      textFieldValue: any;
      focused?: boolean;
      cursorPosition?: number;
      onValueChanged: (newValue: any) => void;
      onKeyDownTextField: (event: React.KeyboardEvent<HTMLInputElement>) => void;
      onKeyUpTextField: (event: React.KeyboardEvent<HTMLInputElement>) => void;
      onClickTextField: (event: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
    }) => JSX.Element;
  }) => {
    const {
      url,
      scopes,
      projectId,
      id,
      value,
      focused,
      completionListOverrideResolver,
      onChange,
      onBlur,
      children,
      completionListOverrideContainerElements,
    } = props;

    const [textFieldValue, setTextFieldValue] = React.useState(value);
    const [showCompletionList, setShowCompletionList] = React.useState(false);
    const [selectedCompletionItem, setSelectedCompletionItem] = React.useState(0);
    const [cursorPosition, setCursorPosition] = React.useState(-1);

    const didComplete = React.useRef<boolean>(false);
    const mainContainerRef = React.useRef<HTMLDivElement>(null);
    const completionListRef = React.useRef<HTMLDivElement>(null);

    const completionItems = useLanguageServer(url, scopes, id, textFieldValue, cursorPosition, projectId);
    const completionListOverride =
      completionListOverrideResolver !== undefined && focused ? completionListOverrideResolver(textFieldValue) : null;

    // If value is provided then component becomes controlled
    React.useEffect(() => {
      if (value !== undefined && value !== textFieldValue) {
        setTextFieldValue(value);
      }
    }, [value, textFieldValue]);

    // Show the completion list again every time the results are different (unless something was just selected from the list)
    React.useEffect(() => {
      setSelectedCompletionItem(0);

      if (didComplete.current) {
        didComplete.current = false;
      } else {
        if (completionItems?.length) {
          setShowCompletionList(true);
        } else {
          setShowCompletionList(false);
        }
      }
    }, [completionItems]);

    // Closes the list of completion items if user clicks away from component or presses "Escape"
    React.useEffect(() => {
      const outsideClickHandler = (event: MouseEvent) => {
        const { x, y } = event;

        let shouldBlur = focused;

        if (mainContainerRef.current && !checkIsOutside(x, y, mainContainerRef.current)) {
          shouldBlur = false;
        }
        if (completionListRef.current && !checkIsOutside(x, y, completionListRef.current)) {
          shouldBlur = false;
        }

        if (completionListOverrideContainerElements?.some((item) => !checkIsOutside(x, y, item))) {
          shouldBlur = false;
        }

        if (shouldBlur) {
          setShowCompletionList(false);
          setCursorPosition(-1);
          onBlur?.(id);
        }
      };

      const keydownHandler = (event: KeyboardEvent) => {
        if ((event.key === 'Escape' || event.key === 'Tab') && focused) {
          setShowCompletionList(false);
          onBlur?.(id);
        }
      };

      document.body.addEventListener('click', outsideClickHandler);
      document.body.addEventListener('keydown', keydownHandler);

      return () => {
        document.body.removeEventListener('click', outsideClickHandler);
        document.body.removeEventListener('keydown', keydownHandler);
      };
    }, [focused, onBlur, completionListOverrideContainerElements]);

    // When textField value is changed
    const onValueChanged = (newValue: string) => {
      setTextFieldValue(newValue);

      onChange(newValue);
    };

    // Set textField value to completion item value
    const setValueToSelectedCompletionItem = (index: number) => {
      if (index < completionItems.length) {
        const selectedSuggestion = completionItems[index].insertText || '';
        const range = completionItems[index].data?.range;

        if (range) {
          const newValue =
            textFieldValue.substr(0, range.start.character) +
            selectedSuggestion +
            textFieldValue.substr(range.end.character);
          onValueChanged(newValue);
          setCursorPosition(range.start.character + selectedSuggestion.length);
        } else {
          onValueChanged(selectedSuggestion);
        }

        // This makes sure we do not show the completion items after a value is picked from the list
        didComplete.current = true;

        setShowCompletionList(false);
      }
    };

    // Handles selection of completion items and validation through keyboard (Up Down to navigate and Enter to validate)
    const onKeyUpMainComponent = (event: React.KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case 'ArrowDown':
          completionItems?.length && setSelectedCompletionItem((index) => (index + 1) % completionItems?.length);
          break;
        case 'ArrowUp':
          completionItems?.length &&
            setSelectedCompletionItem((index) => (completionItems?.length + index - 1) % completionItems?.length);
          break;
        case 'Enter':
          setValueToSelectedCompletionItem(selectedCompletionItem);
          break;
      }
    };

    // Handles validation of a suggested completion item when clicking on it
    const onClickCompletionItem = (suggestionIndex: number) => {
      setValueToSelectedCompletionItem(suggestionIndex);
    };

    // Prevents cursor from moving around in textField when going through the list of completion items
    const onKeyDownTextField = (event: React.KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowUp':
          if (completionItems?.length) {
            event.preventDefault();
          }
          break;
      }
    };

    const onKeyUpTextField = (event: React.KeyboardEvent<HTMLInputElement>) => {
      // Typing also modifies the cursor position
      setCursorPosition((event.target as HTMLInputElement).selectionStart || 0);
    };

    // Updates position of cursor
    const onClickTextField = (event: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
      setCursorPosition((event.target as HTMLInputElement).selectionStart || 0);
    };

    return (
      <div onKeyUp={onKeyUpMainComponent} ref={mainContainerRef} style={{ position: 'relative' }}>
        {children({
          textFieldValue,
          focused,
          cursorPosition,
          onValueChanged,
          onKeyDownTextField,
          onKeyUpTextField,
          onClickTextField,
        })}

        {completionListOverride || showCompletionList ? (
          <CompletionList
            ref={completionListRef}
            completionItems={completionItems}
            selectedItem={selectedCompletionItem}
            onClickCompletionItem={onClickCompletionItem}
            completionListOverride={completionListOverride}
          />
        ) : null}
      </div>
    );
  }
);
