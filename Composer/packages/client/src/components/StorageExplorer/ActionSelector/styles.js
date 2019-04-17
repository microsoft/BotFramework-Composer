import { css } from '@emotion/core';
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';

export const leftNav = css`
  width: 120px;
  height: 100vh;
  background: #2b579a;
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
    background-color: #366ec2;
  }
`;

export const navLinkClass = mergeStyleSets({
  actionNav: {
    backgroundColor: '#2b579a',
    color: 'white',
    fontSize: '16px',
    selectors: {
      '&:hover': {
        displayName: 'testHover',
        color: 'white !important',
        fontSize: '16px',
        backgroundColor: '#366ec2 !important',
      },
      '&:after': {
        border: '0px !important',
        backgroundColor: '#1e3c6b !important',
        z: '-1',
      },
    },
  },
  linkText: {
    zIndex: '1111',
  },
});
