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
  padding: '0 8px 0 8px',
};

const Root = styled.div({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  fontSize: '14px',
  lineHeight: 1,
  background: FluentTheme.palette.neutralLighter,
  color: FluentTheme.palette.neutralPrimary,
  border: `1px solid ${FluentTheme.palette.neutralQuaternaryAlt}`,
  borderRadius: 2,
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
  removeOnBackspace?: boolean;
  onRemove: (i: number) => void;
  onChange: (i: number, value: string) => void;
  onValidate?: (val: string) => boolean;
};

export const Tag = (props: TagProps) => {
  const { value, index, editable, inputRef, onValidate, onChange, onRemove, readOnly, removeOnBackspace } = props;

  const innerEditableRef = React.useRef<HTMLDivElement>(null);
  const remove = React.useCallback(() => onRemove(index), [onRemove, index]);

  return (
    <Root data-selection-disabled>
      {!editable && <div style={tagContentStyles}>{value}</div>}
      {editable && (
        <ContentEditable
          data-selection-disabled
          innerEditableRef={innerEditableRef}
          inputRef={inputRef}
          removeOnBackspace={removeOnBackspace}
          style={tagContentStyles}
          value={value}
          onChange={(newValue) => onChange(index, newValue)}
          onRemove={remove}
          onValidate={onValidate}
        />
      )}
      {!readOnly && (
        <IconButton
          data-selection-disabled
          iconProps={{ iconName: 'ChromeClose' }}
          styles={closeIconStyles}
          onClick={remove}
        />
      )}
    </Root>
  );
};
