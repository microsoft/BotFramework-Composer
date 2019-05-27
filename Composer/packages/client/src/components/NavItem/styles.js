import { css } from '@emotion/core';
import { FontSizes } from '@uifabric/fluent-theme';

export const link = {
  display: 'block',
  textDecoration: 'none',
  color: '#4f4f4f',
};

export const outer = isExpand => css`
  display: flex;
  width: 200px;
  justify-content: flex-end;
  transform: translateX(${isExpand ? '0px' : '-160px'});
  transition: transform 0.3s ease-in-out;
`;

export const iconButton = {
  root: {
    color: 'currentColor',
    height: '40px',
    width: '40px',
    fontSize: `${FontSizes.size16}`,
  },
  icon: {
    fontSize: `${FontSizes.size16}`,
  },
};

export const commandBarButton = {
  root: {
    color: 'currentColor',
    height: '40px',
    width: '200px',
    fontSize: `${FontSizes.size16}`,
    paddingLeft: '0px',
  },
  icon: {
    color: 'currentColor',
    width: '40px',
    paddingRight: '10px',
    boxSizing: 'border-box',
    fontSize: `${FontSizes.size16}`,
  },
  textContainer: {
    textAlign: 'left',
    zIndex: '1',
  },
};
