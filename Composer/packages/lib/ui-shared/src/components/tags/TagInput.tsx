// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { FluentTheme } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import * as React from 'react';

import { Tag } from './Tag';
import { csvToArray } from './utils';

const Root = styled.div({
  position: 'relative',
  boxSizing: 'border-box',
  borderRadius: 2,
  width: '100%',
  height: 'auto',
  minHeight: '32px',
  display: 'flex',
  flexWrap: 'wrap',
  flexDirection: 'row',
  alignItems: 'stretch',
  padding: '0px 4px 4px 0',
  background: 'transparent',
  border: `1px solid ${FluentTheme.palette.neutralTertiary}`,
  '& *': {
    boxSizing: 'border-box',
  },
  '& > *:not(input)': {
    margin: '4px 0 0 8px',
  },
});

const Input = styled.input({
  padding: '0px 8px',
  width: 'auto',
  minWidth: 0,
  flexGrow: 1,
  fontSize: '13px',
  lineHeight: 1,
  background: 'transparent',
  color: FluentTheme.palette.neutralDark,
  border: 'none',
  outline: 0,
  boxShadow: 'none',
  height: '30px',
  '&::placeholder': {
    color: FluentTheme.palette.neutralSecondary,
  },
  '&:focus': {
    border: 'none',
    outline: 'none',
    outlineOffset: '-2px',
  },
  '&:not(:first-of-type)': {
    marginLeft: '8px',
  },
});

type TagInputProps = {
  className?: string;
  editable?: boolean;
  maxTags?: number;
  placeholder?: string;
  readOnly?: boolean;
  removeOnBackspace?: boolean;
  tags: string[];
  onChange: (tags: string[]) => void;
  onValidate?: (val: string) => boolean;
};

export const TagInput = (props: TagInputProps) => {
  const { className, tags, onValidate, removeOnBackspace, onChange, editable, maxTags, placeholder, readOnly } = props;

  const inputRef = React.createRef<HTMLInputElement>();
  const { 0: input, 1: setInput } = React.useState('');

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const addTag = (value: string) => {
    const clonedTags = [...tags];
    // Extract comma separated tags
    const enteredTags = csvToArray(value).filter((t) => !!t);

    // Remove repetitive tags
    const newTags = enteredTags.filter((et) => !clonedTags.includes(et));

    clonedTags.push(...newTags);
    onChange(clonedTags);

    setInput('');
  };

  const removeTag = (i: number) => {
    const clonedTags = [...tags];
    clonedTags.splice(i, 1);
    onChange(clonedTags);
  };

  const onPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    const pasteData = event.clipboardData;

    if (!pasteData.types.includes('text/plain')) {
      return;
    }

    const value = pasteData.getData('text/plain');
    addTag(value);
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Prevent form submission if tag input is nested in <form>
      e.preventDefault();

      // If input is blank, do nothing
      if (!input) {
        return;
      }

      // Check if input is valid
      const valid = onValidate !== undefined ? onValidate(input) : true;
      if (!valid) {
        return;
      }

      // Add input to tag list
      addTag(input);
    } else if (removeOnBackspace && (e.key === 'Backspace' || e.key === 'delete')) {
      // If currently typing, do nothing
      if (input) {
        return;
      }

      // If input is blank, remove previous tag
      removeTag(tags.length - 1);
    }
  };

  const changeTag = (i: number, value: string) => {
    const clonedTags = [...tags];
    const numOccurrencesOfValue = tags.reduce(
      (prev, currentValue, index) => prev + (currentValue === value && index !== i ? 1 : 0),
      0
    );
    if (numOccurrencesOfValue > 0) {
      clonedTags.splice(i, 1);
    } else {
      clonedTags[i] = value;
    }
    onChange(clonedTags);
  };

  const maxTagsReached = maxTags !== undefined ? tags.length >= maxTags : false;
  const isEditable = readOnly ? false : editable || false;
  const showInput = !readOnly && !maxTagsReached;

  return (
    <Root className={className}>
      {tags.map((tag, i) => (
        <Tag
          key={i}
          editable={isEditable}
          index={i}
          inputRef={inputRef}
          readOnly={readOnly || false}
          removeOnBackspace={removeOnBackspace}
          value={tag}
          onChange={changeTag}
          onRemove={removeTag}
          onValidate={onValidate}
        />
      ))}
      {showInput && (
        <Input
          ref={inputRef}
          data-selection-disabled
          placeholder={placeholder || formatMessage('Type and press enter')}
          value={input}
          onChange={onInputChange}
          onKeyDown={onInputKeyDown}
          onPaste={onPaste}
        />
      )}
    </Root>
  );
};
