// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import styled from '@emotion/styled';
import { FluentTheme } from '@uifabric/fluent-theme';
import { IconButton } from 'office-ui-fabric-react/lib/Button';

import { ContentEditable } from './ContentEditable';

const tagContentStyles: React.CSSProperties = {
  outline: 0,
  border: 'none',
  whiteSpace: 'nowrap',
  padding: '0 8px 0 4px',
};

const Root = styled.div({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  fontSize: '14px',
  lineHeight: 1,
  background: FluentTheme.palette.neutralLighter,
  color: FluentTheme.palette.neutralPrimary,
});

const closeIconStyles = {
  root: { width: 24, height: 24 },
  icon: { fontSize: 10, color: FluentTheme.palette.neutralSecondary },
};

type TagProps = {
  value: string;
  index: number;
  editable: boolean;
  readOnly: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  update: (i: number, value: string) => void;
  remove: (i: number) => void;
  validator?: (val: string) => boolean;
  removeOnBackspace?: boolean;
};

export const Tag = (props: TagProps) => {
  const { value, index, editable, inputRef, validator, update, remove, readOnly, removeOnBackspace } = props;
  const innerEditableRef = React.createRef<HTMLDivElement>();

  const onRemove = () => remove(index);

  return (
    <Root data-selection-disabled>
      {!editable && <div style={tagContentStyles}>{value}</div>}
      {editable && (
        <ContentEditable
          data-selection-disabled
          change={(newValue) => update(index, newValue)}
          innerEditableRef={innerEditableRef}
          inputRef={inputRef}
          remove={onRemove}
          removeOnBackspace={removeOnBackspace}
          style={tagContentStyles}
          validator={validator}
          value={value}
        />
      )}
      {!readOnly && (
        <IconButton
          data-selection-disabled
          iconProps={{ iconName: 'ChromeClose' }}
          styles={closeIconStyles}
          onClick={onRemove}
        />
      )}
    </Root>
  );
};
