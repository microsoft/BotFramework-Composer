import { css } from '@emotion/core';
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';

export const backIcon = css`
  font-size: 20px;
  cursor: pointer;
  transform: rotate(90deg);
  width: 20px;
  height: 20px;
  margin: 18px 0px 0px 3px;
  padding: 8px;
  &:hover {
    background-color: rgb(244, 244, 244);
  }
`;

export const detailListContainer = css`
  padding-top: 20px;
  height: calc(100% - 555px);
  overflow-x: hidden;
  width: 640px;
`;

export const fileSelectorContainer = css`
  padding-left: 5px;
  width: 100%;
`;

export const pathNav = css`
  display: flex;
`;

export const loading = css`
  height: 50vh;
  width: 600px;
`;

export const detailListClass = mergeStyleSets({
  fileIconHeaderIcon: {
    padding: 0,
    fontSize: '16px',
  },
  fileIconCell: {
    textAlign: 'center',
    selectors: {
      '&:before': {
        content: '.',
        display: 'inline-block',
        verticalAlign: 'middle',
        height: '100%',
        width: '0px',
        visibility: 'hidden',
      },
    },
  },
  fileIconImg: {
    verticalAlign: 'middle',
    maxHeight: '16px',
    maxWidth: '16px',
  },
});
