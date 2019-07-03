import React from 'react';

export const LoopIndicator = ({ onClick }) => {
  return (
    <div
      style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        background: 'grey',
      }}
      onClick={e => {
        e.stopPropagation();
        onClick();
      }}
    />
  );
};
