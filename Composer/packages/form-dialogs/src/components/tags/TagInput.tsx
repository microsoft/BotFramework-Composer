// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { FluentTheme } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import * as React from 'react';
import { Tag } from 'src/components/tags/Tag';

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
  background: FluentTheme.palette.white,
  padding: '0px 4px 4px 0',
  border: `1px solid ${FluentTheme.palette.neutralTertiary}`,
  '&:focus-within ': {
    borderColor: FluentTheme.palette.neutralTertiary,
    '&::after': {
      content: '""',
      position: 'absolute',
      left: -1,
      top: -1,
      right: -1,
      bottom: -1,
      pointerEvents: 'none',
      borderRadius: 2,
      border: `2px solid ${FluentTheme.palette.themePrimary}`,
      zIndex: 1,
    },
  },
  '& *': {
    boxSizing: 'border-box',
  },
  '& > *:not(input)': {
    margin: '4px 0 0 4px',
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
    marginLeft: '4px',
  },
});

type TagInputProps = {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  validator?: (val: string) => boolean;
  editable?: boolean;
  readOnly?: boolean;
  removeOnBackspace?: boolean;
};

export const TagInput = (props: TagInputProps) => {
  const { tags, validator, removeOnBackspace, onChange, editable, maxTags, placeholder, readOnly } = props;

  const inputRef = React.useRef<HTMLInputElement>();
  const { 0: input, 1: setInput } = React.useState('');

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const addTag = (value: string) => {
    const clonedTags = [...tags];
    if (clonedTags.indexOf(value) === -1) {
      clonedTags.push(value);
      onChange(clonedTags);
    }
    setInput('');
  };

  const removeTag = (i: number) => {
    const clonedTags = [...tags];
    clonedTags.splice(i, 1);
    onChange(clonedTags);
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
      const valid = validator !== undefined ? validator(input) : true;
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

  const updateTag = (i: number, value: string) => {
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
    <Root>
      {tags.map((tag, i) => (
        <Tag
          key={i}
          editable={isEditable}
          index={i}
          inputRef={inputRef}
          readOnly={readOnly || false}
          remove={removeTag}
          removeOnBackspace={removeOnBackspace}
          update={updateTag}
          validator={validator}
          value={tag}
        />
      ))}
      {showInput && (
        <Input
          ref={inputRef}
          placeholder={placeholder || formatMessage('Type and press enter')}
          value={input}
          onChange={onInputChange}
          onKeyDown={onInputKeyDown}
        />
      )}
    </Root>
  );
};
