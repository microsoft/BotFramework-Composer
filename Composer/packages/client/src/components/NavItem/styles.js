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
      right: 1px;
      bottom: 0px;
      left: 1px;
    }

    &:hover {
      background-color: ${active ? NeutralColors.gray40 : NeutralColors.gray30};
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

      &::after {
        border-left: 3px solid ${CommunicationColors.primary};
      }`}
  `}
`;

export const outer = css`
  display: flex;
  width: 220px;
  background-color: transparent;
`;

export const commandBarButton = active => ({
  root: {
    color: active ? '#000' : '#4f4f4f',
    height: '36px',
    width: '220px',
    fontSize: `${FontSizes.size14}`,
    paddingLeft: '0px',
    paddingRight: '0px',
    marginLeft: '0px',
    backgroundColor: 'transparent',
  },
  icon: {
    color: active ? '#000' : '#4f4f4f',
    padding: '0 13px',
    marginLeft: '0px',
    boxSizing: 'border-box',
    fontSize: `${FontSizes.size16}`,
  },
  textContainer: {
    textAlign: 'left',
    zIndex: '1',
    // display: isExpand ? 'inline-block' : 'none',
  },
});
