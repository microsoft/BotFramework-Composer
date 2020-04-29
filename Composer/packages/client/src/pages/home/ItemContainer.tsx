// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, SerializedStyles } from '@emotion/core';
import React from 'react';
import { Button } from 'office-ui-fabric-react/lib/Button';

import {
  itemContainerWrapper,
  itemContainer,
  itemContainerContent,
  itemContainerTitle,
  disabledItem,
  childrenContainer,
} from './styles';

interface ItemContainerProps {
  onClick?: () => void | Promise<void>;
  title: string | JSX.Element;
  content: string;
  styles?: {
    container?: SerializedStyles;
    title?: SerializedStyles;
    content?: SerializedStyles;
  };
  disabled?: boolean;
  forwardedRef?: any;
}

export const ItemContainer: React.FC<ItemContainerProps> = ({
  onClick = undefined,
  title,
  content,
  styles = {},
  disabled,
  forwardedRef,
  ...rest
}) => {
  const onRenderChildren = () => {
    return (
      <div css={childrenContainer}>
        <div css={[itemContainer, styles.title, disabled ? disabledItem.title : undefined]}>
          <div css={itemContainerTitle}>{title}</div>
        </div>
        <div css={[itemContainer, styles.content, disabled ? disabledItem.content : undefined]}>
          <div css={itemContainerContent}>{content}</div>
        </div>
      </div>
    );
  };

  return (
    <Button
      css={[itemContainerWrapper(disabled), styles.container]}
      onClick={async e => {
        e.preventDefault();
        if (onClick) {
          await onClick();
        }
      }}
      ref={forwardedRef}
      {...rest}
      onRenderChildren={onRenderChildren}
      disabled={disabled}
    />
  );
};
