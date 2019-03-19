import { css } from '@emotion/core';
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';

export const container = css`
  width: 1000px;
`;

export const body = css`
  display: flex;
  -webkit-box-flex: 4;
  -ms-flex: 4 4 auto;
  flex: 4 4 auto;
  overflow: hidden;
  position: absolute;
  height: 100vh;
  left: 0;
`;

export const panelNav = css`
  width: 150px;
  height: 100vh;
  background: #2b579a;
  font-size: 20px;
  color: #fff;
`;

export const navHeader = css`
  width: 100%;
  cursor: pointer;
`;

export const iconContainer = css`
  margin-top: 40px;
  padding-left: 30px;
  padding-top: 10px;
  padding-bottom: 10px;
  &:hover {
    background-color: #366ec2;
  }
`;

export const icon = css`
  font-size: 30px;
`;

export const navBody = css`
  width: 100%;
`;

export const linkStyle = css`
  width: 100%;
`;

export const panelContent = css`
  padding-top: 50px;
  width: 810px;
  height: 100vh;
  display: flex;
`;

export const navLinks = mergeStyleSets({
  actionNavLink: {
    displayName: 'testStyle',
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
        backgroundColor: '#366ec2 !important',
        z: '-1',
      },
    },
  },
  sourceNavLink: {
    color: 'black',
    fontSize: '16px',
    width: '200px',
    selectors: {
      '&:after': {
        border: '0px  !important',
      },
    },
  },
  linkText: {
    zIndex: '1111',
  },
});
