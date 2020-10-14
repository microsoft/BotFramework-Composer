// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react/jsx-sort-props */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/no-danger */

import * as React from 'react';
import { safeHtmlString } from 'src/components/tags/utils';

type ContentEditableProps = {
  value: string;
  className?: string;
  innerEditableRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  change: (value: string) => void;
  remove: () => void;
  validator?: (value: string) => boolean;
  removeOnBackspace?: boolean;
};

export const ContentEditable = (props: ContentEditableProps) => {
  const { value, className = '', innerEditableRef, removeOnBackspace, change, validator } = props;

  let removed = false;
  let preFocusedValue = '';

  const getValue = () => props.innerEditableRef.current?.innerText || '';

  const focusInputRef = () => {
    const { inputRef } = props;
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  };

  React.useEffect(() => {
    preFocusedValue = getValue();
  }, []);

  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    // Cancel paste event
    e.preventDefault();

    // Remove formatting from clipboard contents
    const text = e.clipboardData.getData('text/plain');

    // Insert text manually from paste command
    document.execCommand('insertHTML', false, safeHtmlString(text));
  };

  const onFocus = () => {
    preFocusedValue = getValue();
  };

  const onBlur = () => {
    const ref = props.innerEditableRef.current;
    if (!removed && ref) {
      // On blur, if no content in tag, remove it
      if (ref.innerText === '') {
        props.remove();
        return;
      }

      // Validate input if needed
      if (validator) {
        const valid = validator(getValue());
        // If invalidate, switch ref back to pre focused value
        if (!valid) {
          ref.innerText = preFocusedValue;
          return;
        }
      }
      change(ref.innerText);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // On enter, focus main tag input
    if (e.keyCode === 13) {
      e.preventDefault();
      focusInputRef();
      return;
    }

    const currentVal = getValue();
    if (removeOnBackspace && e.keyCode === 8 && currentVal === '') {
      removed = true;
      props.remove();
      focusInputRef();
      return;
    }
  };

  return (
    <div
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
