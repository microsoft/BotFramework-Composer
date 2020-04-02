// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { mergeStyleSets, FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { NeutralColors, FontSizes } from '@uifabric/fluent-theme';

export const pageRoot = css`
  height: 100%;
  display: flex;
  flex-direction: row;
`;

export const contentWrapper = css`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

export const projectContainer = css`
  display: flex;
  flex-direction: column;
  flex-grow: 0;
  flex-shrink: 0;
  width: 255px;
  border-right: 1px solid #c4c4c4;
`;

//remove TODO
export const projectWrapper = css``;

export const projectHeader = css`
  font-weight: bold;
  padding: 7px 10px;
  line-height: 14px;
  font-size: ${FontSizes.size14};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${NeutralColors.gray20};
`;

export const projectTree = css`
  flex-grow: 3;
  flex-shrink: 3;
`;

export const assetTree = css`
  flex-grow: 2;
  flex-shrink: 2;
`;
/*******/

export const editorContainer = css`
  display: flex;
  flex-direction: column;
  height: 100%;
  flex-grow: 4;
`;

export const editorWrapper = css`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  overflow: hidden;
`;

export const visualPanel = css`
  display: flex;
  flex-direction: column;
  flex: 1;
  border-right: 1px solid #c4c4c4;
  position: relative;
`;

export const visualEditor = (hidden: boolean) => css`
  border: 0px;
  flex: 1;
  background-color: #f6f6f6;

  display: ${hidden ? 'none' : 'block'};
`;

export const formEditor = css`
  max-width: 400px;
  flex: 1;
  border: 0px;
  transition: width 0.2s ease-in-out;
`;

export const breadcrumbClass = mergeStyleSets({
  root: {
    margin: '0',
    padding: '10px',
  },
  itemLink: {
    selectors: {
      '.ms-TooltipHost': {
        fontSize: FontSizes.size18,
        fontWeight: FontWeights.regular,
      },
    },
    color: '#333',
    padding: '4px 8px',
  },
  chevron: {
    fontSize: FontSizes.size10,
  },
});

export const deleteDialogContent = css`
  color: #000;
`;

export const middleTriggerContainer = css`
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f6f6f6;
  width: 100%;
  margin-top: 55px;
  height: calc(100% - 48px);
  position: absolute;
`;

export const middleTriggerElements = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 18px;
  line-height: 24px;
  color: #828282;
`;

export const triggerButton = css`
  font-size: 12px;
  color: #0078d4;
`;

export const styles = {
  dialog: {
    title: {
      fontWeight: FontWeights.bold,
      fontSize: FontSizes.size20,
      paddingTop: '14px',
      paddingBottom: '11px',
    },
    subText: {
      fontSize: FontSizes.size14,
    },
  },
  modal: {
    main: {
      maxWidth: '80% !important',
      width: '960px !important',
    },
  },
  halfstack: {
    root: [
      {
        flexBasis: '50%',
      },
    ],
  },
  stackinput: {
    root: [
      {
        marginBottom: '1rem',
      },
    ],
  },
};

export const textFieldlabel = {
  label: {
    root: [
      {
        fontWeight: FontWeights.semibold,
      },
    ],
  },
};

export const name = {
  subComponentStyles: textFieldlabel,
};

export const description = {
  subComponentStyles: textFieldlabel,
};
