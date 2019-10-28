import React from 'react';

import { itemContainer, itemContainerContent, itemContainerTitle } from './styles';

export const ItemContainer = ({ onClick, title, content, styles = {} }) => {
  const container = { height: '50%', position: 'relative' };
  return (
    <div
      css={itemContainer}
      onClick={async e => {
        e.preventDefault();
        if (onClick) {
          await onClick();
        }
      }}
    >
      <div css={{ ...container, ...(styles.title ? styles.title : {}) }}>
        <div css={itemContainerTitle}>{title}</div>
      </div>
      <div css={{ ...container, ...(styles.content ? styles.content : {}) }}>
        <div css={itemContainerContent}>{content}</div>
      </div>
    </div>
  );
};
