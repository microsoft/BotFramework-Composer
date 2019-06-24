import { css } from '@emotion/core';
import { FontSizes } from '@uifabric/fluent-theme';
import { NeutralColors, CommunicationColors } from '@uifabric/fluent-theme';

export const link = (active, underTest) => css`
  display: block;
  text-decoration: none;
  color: #4f4f4f;
  position: relative;
  ${underTest && `pointer-events: none;`}
  ${!underTest &&
    `&::after {
      content: '';
      position: absolute;
      top: 0px;
      right: 0px;
      bottom: 0px;
      left: 0px;
    }

    &:hover {
      background-color: ${NeutralColors.gray30};
    }
    
    &:focus {
      outline: none;
      .ms-Fabric--isFocusVisible &::after {
        content: "";
        position: absolute;
        z-index: 1;
        border: 1px solid ${NeutralColors.white};
        border-image: initial;
        outline: rgb(102, 102, 102) solid 1px;
      }
    }
    
    ${active &&
      `background-color: ${NeutralColors.gray40};
      &:hover {
        background-color: ${NeutralColors.gray50} !important;
      }

      &::after {
        border-left: 3px solid ${CommunicationColors.primary};
      }`}
  `}
`;

export const outer = isExpand => css`
  display: flex;
  width: 220px;
  justify-content: flex-end;
  transform: translateX(${isExpand ? '0px' : '-175px'});
  transition: transform 0.3s ease-in-out;
  background-color: transparent;
`;

export const iconButton = {
  root: {
    color: 'currentColor',
    height: '36px',
    width: '45px',
    fontSize: `${FontSizes.size14}`,
    backgroundColor: 'transparent',
  },
  icon: {
    fontSize: `${FontSizes.size16}`,
  },
};

export const commandBarButton = {
  root: {
    color: '#000000',
    height: '36px',
    width: '220px',
    fontSize: `${FontSizes.size14}`,
    paddingLeft: '0px',
    marginLeft: '0px',
    backgroundColor: 'transparent',
  },
  icon: {
    color: '#000000',
    width: '45px',
    paddingLeft: '0px',
    marginLeft: '0px',
    boxSizing: 'border-box',
    fontSize: `${FontSizes.size16}`,
  },
  textContainer: {
    textAlign: 'left',
    zIndex: '1',
  },
};
