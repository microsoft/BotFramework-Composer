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

interface ItemContainerProps extends Omit<IButtonProps, 'onChange' | 'styles' | 'title'> {
  onClick?: () => void | Promise<void>;
  title: string | JSX.Element;
  subContent?: string;
  content: string;
  styles?: {
    container?: SerializedStyles;
    title?: SerializedStyles;
    content?: SerializedStyles;
  };
  disabled?: boolean;
  forwardedRef?: (project: any) => void | Promise<void>;
  openExternal?: boolean;
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
  ...rest
}) => {
  const onRenderChildren = () => {
    return (
      <div ref={forwardedRef} aria-label={ariaLabel} css={childrenContainer}>
        <div css={[itemContainer, styles.title, disabled ? disabledItem.title : undefined]}>
          <div css={itemContainerTitle}>
            <Text block variant="large">
              {title}
            </Text>
          </div>
        </div>
        <div css={[itemContainer, styles.content, disabled ? disabledItem.content : undefined]}>
          <div css={itemContainerContent}>
            <Text nowrap variant={subContent ? 'medium' : 'large'}>
              {content}
            </Text>
            {subContent && (
              <Text nowrap variant="medium">
                {subContent}
              </Text>
            )}
          </div>
        </div>
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
