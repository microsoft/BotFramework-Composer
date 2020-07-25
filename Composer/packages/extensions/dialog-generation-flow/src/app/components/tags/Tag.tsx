// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IconButton } from '@fluentui/react/lib/Button';
import * as React from 'react';
import { ContentEditable } from 'src/app/components/tags/ContentEditable';
import { getStylistV2 } from 'src/app/theme/stylist';

const { getClassName, styleDiv } = getStylistV2('Tag');

const tagContentClassName = getClassName('tagContent', {
  outline: 0,
  border: 'none',
  whiteSpace: 'nowrap',
  padding: '0 4px',
});

const Root = styleDiv('TagRoot', (theme) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  fontSize: '14px',
  lineHeight: 1,
  background: theme.backgroundColor,
  color: theme.color,
  border: `1px solid ${theme.borderColor}`,
}));

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
      {!editable && <div className={tagContentClassName}>{value}</div>}
      {editable && (
        <ContentEditable
          change={(newValue) => update(index, newValue)}
          className={tagContentClassName}
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
