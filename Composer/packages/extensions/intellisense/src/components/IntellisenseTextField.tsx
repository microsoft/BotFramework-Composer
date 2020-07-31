// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { ITextFieldProps, TextField } from 'office-ui-fabric-react/lib/TextField';
import React from 'react';
import { css, jsx } from '@emotion/core';

import { useLanguageServer } from '../hooks/useLanguageServer';
import { checkIsOutside } from '../utils/uiUtils';

import { CompletionList } from './CompletionList';

const styles = {
  textField: css`
    width: 300px;
  `,
};

export const IntellisenseTextField = (
  props: {
    url: string;
    scopes: string[];
    projectId?: string;
    id: string;
    value?: string;
    onChange: (newValue: string) => void;
  } & Omit<Partial<ITextFieldProps>, 'onChange'>
) => {
  const { url, scopes, projectId, id, value, onChange, ...rest } = props;

  const [textFieldValue, setTextFieldValue] = React.useState('');
  const [showCompletionList, setShowCompletionList] = React.useState(false);
  const [selectedCompletionItem, setSelectedCompletionItem] = React.useState(0);
  const [cursorPosition, setCursorPosition] = React.useState(0);

  const didComplete = React.useRef<boolean>(false);
  const mainContainerRef = React.useRef<HTMLDivElement>(null);
  const completionListRef = React.useRef<HTMLDivElement>(null);

  const completionItems = useLanguageServer(url, scopes, id, textFieldValue, cursorPosition, projectId);

  // If value is provided then component becomes controlled
  React.useEffect(() => {
    if (value && value !== textFieldValue) {
      setTextFieldValue(value);
    }
  }, [value]);

  // Show the completion list again every time the results are different (unless something was just selected from the list)
  React.useEffect(() => {
    setSelectedCompletionItem(0);

    if (didComplete.current) {
      didComplete.current = false;
    } else {
      setShowCompletionList(true);
    }
  }, [completionItems]);

  // Closes the list of completion items if user clicks away from component or presses "Escape"
  React.useEffect(() => {
    const outsideClickHandler = (event: MouseEvent) => {
      const { x, y } = event;

      if (mainContainerRef.current && completionListRef.current) {
        if (checkIsOutside(x, y, mainContainerRef.current) && checkIsOutside(x, y, completionListRef.current)) {
          setShowCompletionList(false);
        }
      }
    };

    const keyupHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowCompletionList(false);
      }
    };

    document.body.addEventListener('click', outsideClickHandler);
    document.body.addEventListener('keyup', keyupHandler);

    return () => {
      document.body.removeEventListener('click', outsideClickHandler);
      document.body.removeEventListener('keyup', keyupHandler);
    };
  }, []);

  // When textField value is changed
  const onValueChanged = (newValue: string) => {
    setTextFieldValue(newValue);

    onChange(newValue);
  };

  // Set textField value to completion item value
  const setValueToSelectedCompletionItem = (index: number) => {
    if (completionItems.length >= index) {
      const selectedSuggestion = completionItems[index].insertText || '';
      const range = completionItems[index].data.range;

      if (range) {
        const newValue =
          textFieldValue.substr(0, range.start.character) +
          selectedSuggestion +
          textFieldValue.substr(range.end.character);
        onValueChanged(newValue);
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
    // Typing also modifies the cursor position
    setCursorPosition((event.target as HTMLInputElement).selectionStart || 0);
  };

  // Updates position of cursor
  const onClickTextField = (event: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
    setCursorPosition((event.target as HTMLInputElement).selectionStart || 0);
  };

  return (
    <div onKeyUp={onKeyUpMainComponent} ref={mainContainerRef} style={{ position: 'relative' }}>
      <TextField
        {...rest}
        id={id}
        value={textFieldValue}
        onChange={(_e, newValue) => onValueChanged(newValue || '')}
        onKeyDown={onKeyDownTextField}
        onClick={onClickTextField}
        css={styles.textField}
      />

      {showCompletionList && (
        <CompletionList
          ref={completionListRef}
          completionItems={completionItems}
          selectedItem={selectedCompletionItem}
          onClickCompletionItem={onClickCompletionItem}
        />
      )}
    </div>
  );
};
