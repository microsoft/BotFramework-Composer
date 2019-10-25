import React from 'react';

export const ItemContainer = ({ onClick, title, content, styles = {} }) => {
  const container = { height: '50%', position: 'relative' };
  const center = {
    position: 'absolute',
    fontWeight: 600,
    width: '90%',
    maxHeight: '45%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    wordBreak: 'break-word',
    transform: 'translate(10px, 20px)',
    webkitboxorient: 'vertical',
    webkitlineclamp: 2,
    display: '-webkit-box !important',
  };
  return (
    <div
      css={{
        boxShadow: '0px 0.6px 1.8px rgba(0, 0, 0, 0.108), 0px 3.2px 7.2px rgba(0, 0, 0, 0.132)',
        borderRadius: '2px',
        position: 'relative',
        cursor: 'pointer',
        display: 'block',
        minHeight: '120px',
        minWidth: '150px',
        height: '13vh',
        width: '11vw',
        marginRight: '30px',
      }}
      onClick={async e => {
        e.preventDefault();
        await onClick();
      }}
    >
      <div css={{ ...container, ...(styles.title ? styles.title : {}) }}>
        <div css={center}>{title}</div>
      </div>
      <div css={{ ...container, ...(styles.content ? styles.content : {}) }}>
        <div css={center}>{content}</div>
      </div>
    </div>
  );
};
