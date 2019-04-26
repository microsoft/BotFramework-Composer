import React from 'react';

const getOutline = (id, focused, selectedNodes = []) => {
  const found = selectedNodes.find(element => {
    return element === id;
  });

  if (found || focused) {
    return { stroke: '#0078d3', strokeWidth: '3px', strokeLinejoin: 'round' };
  }
  return undefined;
};

export const Diamond = ({ id, onClick, focused, nodeRefs, selectedNodes }) => (
  <div
    style={{
      width: '50px',
      height: '20px',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
    }}
    onClick={e => {
      e.stopPropagation();
      onClick();
    }}
    ref={el => {
      if (el && nodeRefs) {
        nodeRefs[id] = el;
      }
    }}
  >
    <svg
      width="50"
      height={getOutline(id, focused, selectedNodes) ? '23' : '20'}
      viewBox="0 0 50 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path style={getOutline(id, focused, selectedNodes)} d="M25 0L50 10L25 20L-2.7865e-06 10L25 0Z" fill="#979797" />
    </svg>
  </div>
);
