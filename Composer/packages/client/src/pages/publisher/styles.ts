// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { css } from '@emotion/core';
import { IStackTokens } from 'office-ui-fabric-react/lib/Stack';
import { mergeStyleSets } from 'office-ui-fabric-react/lib/Styling';
import { SharedColors } from '@uifabric/fluent-theme';
import { ICardTokens, ICardSectionStyles, ICardSectionTokens } from '@uifabric/react-cards';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { ITextStyles } from 'office-ui-fabric-react/lib/Text';
import { IButtonStyles } from 'office-ui-fabric-react/lib/Button';

export const root = css`
  display: flex;
  height: 100%;
  flex-direction: column;
`;

export const publisherHeader = {
  container: css`
    border-bottom: 1px solid #edebe9;
    height: 90px;
    padding: 14px 38px 8px 29px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  `,

  text: css`
    font-size: 20px;
    color: #323130;
    font-weight: bold;
  `,
};

export const publisherList = {
  containter: css`
    position: relative;
    overflow-y: auto;
    flex-grow: 1;
    display: flex;
    flex-direction: row;
  `,
  list: css`
    position: relative;
    width: 340px;
  `,
};

export const historyListStyles = {
  root: css`
    display: flex;
    height: 100%;
    flex-direction: column;
  `,

  listRoot: css`
    position: relative;
    overflow-y: auto;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    border-left: 1px solid #c4c4c4;
  `,

  tableView: css`
    position: relative;
    flex-grow: 1;
  `,

  detailList: css`
    overflow-x: hidden;
  `,

  action: css`
    height: auto;
    font-size: 12px;
  `,
};

export const iconStyles = mergeStyleSets({
  typeIconHeaderIcon: {
    padding: 0,
    fontSize: '16px',
  },
  typeIconCell: {
    textAlign: 'center',
    cursor: 'pointer',
  },
  columnCell: {
    cursor: 'pointer',
  },
});

export const typeIcon = (running: boolean) => css`
  vertical-align: middle;
  font-size: 16px;
  width: 24px;
  height: 24px;
  line-height: 24px;
  color: ${running ? SharedColors.yellowGreen10 : SharedColors.gray10};
  cursor: pointer;
`;

export const sectionStackTokens: IStackTokens = { childrenGap: 20, padding: 20 };

export const buttonStyles: IButtonStyles = {
  root: {
    width: 30,
    height: 20,
    fontSize: 10,
  },
};

export const idTextStyles: ITextStyles = {
  root: {
    color: '#025F52',
    fontWeight: FontWeights.semibold,
  },
};
export const nameTextStyles: ITextStyles = {
  root: {
    color: '#333333',
    fontWeight: FontWeights.regular,
  },
};
export const endpointTextStyles: ITextStyles = {
  root: {
    color: '#333333',
    fontWeight: FontWeights.regular,
  },
};

export const detailCardSectionStyles: ICardSectionStyles = {
  root: {
    flex: 1,
  },
};
export const footerCardSectionStyles: ICardSectionStyles = {
  root: {
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'row',
  },
};
export const cardIconStyles = (online?: boolean) => css`
  color: ${online ? SharedColors.yellowGreen10 : SharedColors.gray10};
  font-size: 12px;
  font-weight: ${FontWeights.regular};
  margin-top: 6px !important;
  margin-left: 5px;
`;
export const cardTokens: ICardTokens = { childrenMargin: 12, width: 120 };
export const footerCardSectionTokens: ICardSectionTokens = { padding: '0px 0px 0px 12px' };
