// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, SerializedStyles } from '@emotion/core';
import React from 'react';
import { Button } from 'office-ui-fabric-react/lib/Button';
import { Text } from 'office-ui-fabric-react/lib/Text';

import { isElectron } from '../../utils/electronUtil';

import {
  itemContainerWrapper,
  itemContainer,
  itemContainerContent,
  itemContainerTitle,
  disabledItem,
  childrenContainer,
} from './styles';

const { openExternal } = window;

type onClickFunctionType = () => void | Promise<void>;

interface ItemContainerProps {
  onClick?: onClickFunctionType | boolean;
  title: string | JSX.Element;
  subContent?: string;
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
  subContent,
  styles = {},
  disabled,
  forwardedRef,
  ...rest
}) => {
  const onRenderChildren = () => {
    return (
      <div css={childrenContainer} ref={forwardedRef}>
        <div css={[itemContainer, styles.title, disabled ? disabledItem.title : undefined]}>
          <div css={itemContainerTitle}>
            <Text block variant="large">
              {title}
            </Text>
          </div>
        </div>
        <div css={[itemContainer, styles.content, disabled ? disabledItem.content : undefined]}>
          <div css={itemContainerContent}>
            <Text variant={subContent ? 'medium' : 'large'} nowrap>
              {content}
            </Text>
            {subContent && (
              <Text variant="medium" nowrap>
                {subContent}
              </Text>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Button
      css={[itemContainerWrapper(disabled), styles.container]}
      onClick={async e => {
        const { href } = rest;
        if (onClick) {
          if (isElectron() && onClick === true) {
            e.preventDefault();
            return openExternal(href, { activate: true });
          }
          if (!href) {
            e.preventDefault();
            await onClick();
          }
        }
      }}
      {...rest}
      onRenderChildren={onRenderChildren}
      disabled={disabled}
    />
  );
};
