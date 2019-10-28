import React from 'react';

import { itemContainer, itemContainerContent, itemContainerTitle } from './styles';

export const ItemContainer = ({ onClick, title, content, styles = {} }) => {
  const container = { height: '50%', position: 'relative' };
  return (
    <div
      css={itemContainer}
      style={styles.container}
      onClick={async e => {
        e.preventDefault();
        if (onClick) {
          await onClick();
        }
      }}
    >
      <div css={styles.title ? { ...container, ...styles.title } : container}>
        <div css={itemContainerTitle}>{title}</div>
      </div>
      <div css={styles.content ? { ...container, ...styles.content } : container}>
        <div css={itemContainerContent}>{content}</div>
      </div>
    </div>
  );
};
