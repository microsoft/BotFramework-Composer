import { css } from '@emotion/core';
import { FontSizes } from '@uifabric/fluent-theme';

export const link = {
  display: 'block',
  textDecoration: 'none',
  color: '#4f4f4f',
};

export const outer = (isExpand, active) => css`
  display: flex;
  width: 200px;
  justify-content: flex-end;
  transform: translateX(${isExpand ? '0px' : '-160px'});
  transition: transform 0.3s ease-in-out;
  background-color: ${active ? '#E1DFDD' : '#F3F2F1'};
`;

export const iconButton = {
  root: {
    color: 'currentColor',
    height: '40px',
    width: '38px',
    fontSize: `${FontSizes.size14}`,
  },
  icon: {
    fontSize: `${FontSizes.size14}`,
  },
};

export const commandBarButton = active => {
  const normal = {
    root: {
      color: '#000000',
      height: '40px',
      width: '198px',
      fontSize: `${FontSizes.size14}`,
      paddingLeft: '0px',
    },
    icon: {
      color: '#000000',
      width: '40px',
      paddingRight: '10px',
      boxSizing: 'border-box',
      fontSize: `${FontSizes.size14}`,
    },
    textContainer: {
      textAlign: 'left',
      zIndex: '1',
    },
  };
  if (active) normal.root.backgroundColor = '#E1DFDD';
  return normal;
};

export const lockedBar = {
  backgroundColor: '#0078D4',
  width: '2px',
  height: '40px',
};
