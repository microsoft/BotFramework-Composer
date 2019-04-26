import { css } from '@emotion/core';
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';

export const title = css`
  padding: 37px 30px 2px 30px;
  font-size: 34px;
  color: #2b579a !important;
  font-weight: lighter;
`;

export const navLinkClass = mergeStyleSets({
  storageNav: {
    color: 'black',
    fontSize: '16px',
    width: '200px',
    selectors: {
      '&:after': {
        border: '0px !important',
      },
    },
  },
  linkText: {
    zIndex: '1111',
  },
});
