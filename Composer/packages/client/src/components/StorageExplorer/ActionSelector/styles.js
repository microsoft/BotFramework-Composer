import { css } from '@emotion/core';
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';
import { SharedColors } from '@uifabric/fluent-theme';

export const leftNav = css`
  width: 120px;
  height: 100vh;
  background: ${SharedColors.cyanBlue10};
  font-size: 20px;
  color: #fff;
`;

export const navHeader = css`
  width: 100%;
  cursor: pointer;
`;

export const closeIcon = css`
  font-size: 30px;
  margin-top: 40px;
  padding-left: 30px;
  padding-top: 10px;
  padding-bottom: 10px;
  width: 90px;
  &:hover {
    background-color: ${SharedColors.cyanBlue20};
  }
`;

export const navLinkClass = mergeStyleSets({
  actionNav: {
    backgroundColor: SharedColors.cyanBlue10,
    color: 'white',
    fontSize: '16px',
    selectors: {
      '&:hover': {
        displayName: 'testHover',
        color: 'white !important',
        fontSize: '16px',
        backgroundColor: `${SharedColors.cyanBlue20} !important`,
      },
      '&:after': {
        border: '0px !important',
        backgroundColor: `${SharedColors.cyanBlue20} !important`,
        z: '-1',
      },
    },
  },
  linkText: {
    zIndex: '1111',
  },
});
