// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, SerializedStyles } from '@emotion/core';
import React from 'react';
import { DefaultButton, IButtonProps } from 'office-ui-fabric-react/lib/Button';
import { Text } from 'office-ui-fabric-react/lib/Text';

import {
  itemContainerWrapper,
  itemContainer,
  itemContainerContent,
  itemContainerTitle,
  disabledItem,
  childrenContainer,
} from './styles';
import formatMessage from 'format-message';
import { Link } from 'office-ui-fabric-react';

interface ItemContainerProps extends Omit<IButtonProps, 'onChange' | 'styles' | 'title'> {
  onClick?: () => void | Promise<void>;
  imageCover?: any;
  title: string | JSX.Element;
  subContent?: string;
  content: string;
  styles?: {
    container?: SerializedStyles;
    title?: SerializedStyles;
    imageCover?: SerializedStyles;
    content?: SerializedStyles;
  };
  disabled?: boolean;
  forwardedRef?: (project: any) => void | Promise<void>;
  openExternal?: boolean;
  moreLinkText?: string;
  ariaLabel: string;
}

export const ItemContainer: React.FC<ItemContainerProps> = ({
  onClick = undefined,
  title,
  content,
  subContent,
  styles = {},
  disabled,
  forwardedRef,
  openExternal,
  ariaLabel,
  imageCover,
  moreLinkText,
  ...rest
}) => {
  const onRenderChildren = () => {
    return (
      <div ref={forwardedRef} aria-label={ariaLabel} css={childrenContainer}>
        {imageCover && (
          <img
            alt={formatMessage('Composer Logo')}
            aria-label={formatMessage('Composer Logo')}
            src={imageCover}
            css={styles.imageCover}
          />
        )}

        <div css={styles.title}>{title}</div>
        <div css={styles.content}>{content}</div>
        {moreLinkText && <Link> {moreLinkText} </Link>}
      </div>
    );
  };

  return (
    <DefaultButton
      css={[itemContainerWrapper(disabled), styles.container]}
      onClick={async (e) => {
        if (onClick != null) {
          e.preventDefault();
          await onClick();
        }
      }}
      {...rest}
      disabled={disabled}
      onRenderChildren={onRenderChildren}
    />
  );
};
