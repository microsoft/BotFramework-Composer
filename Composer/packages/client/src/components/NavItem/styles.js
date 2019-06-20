import { css } from '@emotion/core';
import { FontSizes } from '@uifabric/fluent-theme';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';

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
  background-color: ${active ? NeutralColors.gray40 : NeutralColors.gray20};
`;

export const iconButton = active => {
  const normal = {
    root: {
      color: 'currentColor',
      height: '40px',
      width: '38px',
      fontSize: `${FontSizes.size14}`,
    },
    icon: {
      fontSize: `${FontSizes.size14}`,
    },
    rootHovered: {
      backgroundColor: `${NeutralColors.gray30}`,
    },
  };
  if (active) normal.root.backgroundColor = NeutralColors.gray40;
  if (active) normal.rootHovered.backgroundColor = NeutralColors.gray50;
  return normal;
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
    rootHovered: {
      backgroundColor: `${NeutralColors.gray30}`,
    },
  };
  if (active) normal.root.backgroundColor = NeutralColors.gray40;
  if (active) normal.rootHovered.backgroundColor = NeutralColors.gray50;
  return normal;
};

export const lockedBar = {
  backgroundColor: SharedColors.cyanBlue10,
  width: '2px',
  height: '40px',
};
