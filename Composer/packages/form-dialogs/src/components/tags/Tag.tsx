// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { FluentTheme } from '@uifabric/fluent-theme';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import * as React from 'react';
import { ContentEditable } from 'src/components/tags/ContentEditable';

const tagContentStyles = css`
  outline: 0;
  border: none;
  white-space: nowrap;
  padding: 0 4px;
`;

const Root = styled.div({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  fontSize: '14px',
  lineHeight: 1,
  background: FluentTheme.palette.neutralLight,
  color: FluentTheme.palette.neutralDark,
});

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
  const innerEditableRef = React.useRef<HTMLDivElement>();

  const onRemove = () => remove(index);

  return (
    <Root>
      {!editable && <div css={tagContentStyles}>{value}</div>}
      {editable && (
        <ContentEditable
          change={(newValue) => update(index, newValue)}
          css={tagContentStyles}
          innerEditableRef={innerEditableRef}
          inputRef={inputRef}
          remove={onRemove}
          removeOnBackspace={removeOnBackspace}
          validator={validator}
          value={value}
        />
      )}
      {!readOnly && (
        <IconButton
          iconProps={{ iconName: 'ChromeClose' }}
          styles={{ root: { width: 24, height: 24 }, icon: { fontSize: 10 } }}
          onClick={onRemove}
        />
      )}
    </Root>
  );
};
