// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react/jsx-sort-props */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/no-danger */

import * as React from 'react';

import { safeHtmlString } from './utils';

type ContentEditableProps = {
  value: string;
  className?: string;
  innerEditableRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  removeOnBackspace?: boolean;
  style?: React.CSSProperties;
  onChange: (value: string) => void;
  onRemove: () => void;
  onValidate?: (value: string) => boolean;
};

export const ContentEditable = (props: ContentEditableProps) => {
  const {
    value,
    className = '',
    style,
    innerEditableRef,
    inputRef,
    removeOnBackspace,
    onChange,
    onRemove,
    onValidate,
  } = props;

  const removed = React.useRef(false);
  const preFocusedValue = React.useRef('');

  const getValue = () => innerEditableRef.current?.innerText || '';

  const focusInputRef = React.useCallback(() => {
    if (inputRef?.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  React.useEffect(() => {
    preFocusedValue.current = getValue();
  }, []);

  const onPaste = React.useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    // Cancel paste event
    e.preventDefault();

    // Remove formatting from clipboard contents
    const text = e.clipboardData.getData('text/plain');

    // Insert text manually from paste command
    document.execCommand('insertHTML', false, safeHtmlString(text));
  }, []);

  const onFocus = React.useCallback(() => {
    preFocusedValue.current = getValue();
  }, []);

  const onBlur = React.useCallback(() => {
    if (!removed && innerEditableRef.current) {
      // On blur, if no content in tag, remove it
      if (innerEditableRef.current.innerText === '') {
        onRemove();
        return;
      }

      // Validate input if needed
      if (onValidate) {
        const valid = onValidate(getValue());
        // If invalidate, switch ref back to pre focused value
        if (!valid) {
          innerEditableRef.current.innerText = preFocusedValue.current;
          return;
        }
      }
      onChange(innerEditableRef.current.innerText);
    }
  }, [onChange, onRemove, onValidate, innerEditableRef]);

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // On enter, focus main tag input
      if (e.key === 'Enter') {
        e.preventDefault();
        focusInputRef();
        return;
      }

      const currentVal = getValue();
      if (removeOnBackspace && e.key === 'Backspace' && currentVal === '') {
        removed.current = true;
        onRemove();
        focusInputRef();
        return;
      }
    },
    [removeOnBackspace, onRemove, focusInputRef]
  );

  return (
    <div
      style={style}
      dangerouslySetInnerHTML={{ __html: safeHtmlString(value) }}
      ref={innerEditableRef}
      className={className}
      contentEditable
      onBlur={onBlur}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
    />
  );
};
