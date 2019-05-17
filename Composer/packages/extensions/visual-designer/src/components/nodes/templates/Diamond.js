import React from 'react';

export const Diamond = ({ onClick, ...rest }) => (
  <div
    {...rest}
    style={{
      width: '50px',
      height: '20px',
      cursor: 'pointer',
    }}
    onClick={e => {
      e.stopPropagation();
      onClick();
    }}
  >
    <svg width="50" height="20" viewBox="0 0 50 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M25 0L50 10L25 20L-2.7865e-06 10L25 0Z" fill="#979797" />
    </svg>
  </div>
);
