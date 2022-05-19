// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/react';
import React, { useEffect, useRef } from 'react';
import { FieldProps } from '@bfc/extension-client';
import { NeutralColors } from '@fluentui/theme';
import { IconButton } from '@fluentui/react/lib/Button';
import { FontSizes } from '@fluentui/style-utilities';
import { IContextualMenuItem } from '@fluentui/react/lib/ContextualMenu';
import formatMessage from 'format-message';

import { SchemaField } from '../SchemaField';

import { arrayItem } from './styles';

interface ArrayFieldItemProps extends FieldProps {
  index: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canRemove: boolean;
  stackArrayItems?: boolean;
  onReorder: (aIdx: number) => void;
  onRemove: () => void;
  ariaLabel?: string;
  autofocus?: boolean;
}

const ArrayFieldItem: React.FC<ArrayFieldItemProps> = (props) => {
  const {
    canMoveUp,
    canMoveDown,
    canRemove,
    onReorder,
    onRemove,
    index,
    label,
    onBlur,
    uiOptions,
    value,
    className,
    rawErrors,
    ariaLabel,
    autofocus,
    ...rest
  } = props;

  // This needs to return true to dismiss the menu after a click.
  const fabricMenuItemClickHandler = (fn) => (e) => {
    fn(e);
    return true;
  };

  const contextItems: IContextualMenuItem[] = [
    {
      key: 'moveUp',
      text: formatMessage('Move up'),
      iconProps: { iconName: 'CaretSolidUp' },
      disabled: !canMoveUp,
      onClick: fabricMenuItemClickHandler(() => onReorder(index - 1)),
    },
    {
      key: 'moveDown',
      text: formatMessage('Move down'),
      iconProps: { iconName: 'CaretSolidDown' },
      disabled: !canMoveDown,
      onClick: fabricMenuItemClickHandler(() => onReorder(index + 1)),
    },
    {
      key: 'remove',
      text: formatMessage('Remove'),
      iconProps: { iconName: 'Cancel' },
      disabled: !canRemove,
      onClick: fabricMenuItemClickHandler(onRemove),
    },
  ];

  const fieldRowRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autofocus && fieldRowRootRef.current) {
      fieldRowRootRef.current.focus();
    }
  }, [autofocus]);

  const handleBlur = () => {
    if (typeof onBlur === 'function') {
      onBlur(rest.id, value);
    }
  };

  return (
    <div
      ref={fieldRowRootRef}
      aria-label={ariaLabel}
      className={`${className} ${arrayItem.contaInerFocus}`}
      css={arrayItem.container}
      data-testid="ArrayFieldItem"
      role="region"
      tabIndex={-1}
    >
      <div css={arrayItem.field}>
        <SchemaField
          {...rest}
          css={arrayItem.schemaFieldOverride}
          label={label}
          placeholder={undefined}
          rawErrors={typeof rawErrors === 'object' ? rawErrors[index] : rawErrors}
          uiOptions={{ ...uiOptions, placeholder: undefined }}
          value={value}
          onBlur={handleBlur}
        />
      </div>
      <IconButton
        ariaLabel={formatMessage('Item actions')}
        menuIconProps={{ iconName: 'MoreVertical' }}
        menuProps={{ items: contextItems }}
        styles={{
          menuIcon: { color: NeutralColors.black, fontSize: FontSizes.medium },
        }}
      />
    </div>
  );
};

export { ArrayFieldItem };
