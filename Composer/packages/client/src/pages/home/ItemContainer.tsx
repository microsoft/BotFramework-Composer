// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css, SerializedStyles } from '@emotion/core';
import React from 'react';

import { itemContainer, itemContainerContent, itemContainerTitle } from './styles';

interface ItemContainerProps {
  onClick?: () => void | Promise<void>;
  title: string | JSX.Element;
  content: string;
  styles: {
    container?: SerializedStyles;
    title?: SerializedStyles;
    content?: SerializedStyles;
  };
}

export const ItemContainer: React.FC<ItemContainerProps> = ({ onClick = undefined, title, content, styles = {} }) => {
  const container = css({ height: '50%' });
  return (
    <div
      css={[itemContainer, styles.container]}
      onClick={async e => {
        e.preventDefault();
        if (onClick) {
          await onClick();
        }
      }}
    >
      <div css={[container, styles.title]}>
        <div css={itemContainerTitle}>{title}</div>
      </div>
      <div css={[container, styles.content]}>
        <div css={itemContainerContent}>{content}</div>
      </div>
    </div>
  );
};
