// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { css } from '@emotion/react';
import { FontWeights } from '@fluentui/style-utilities';
import { FontSizes, SharedColors, NeutralColors } from '@fluentui/theme';
import { IDropdownStyles } from '@fluentui/react/lib/Dropdown';

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
  modalCreateFromUrl: {
    main: {
      maxWidth: '920px !important',
      flexBasis: '100%',
    },
  },
  modalCreateFromScratch: {
    main: {
      maxWidth: '600px !important',
    },
  },
};

export const contentBox = css`
  display: flex;
  min-height: 320px;
  border: 1px solid #f3f2f1;
  height: 429px;
  @media screen and (max-width: 640px) /* 200% zoom */ {
    flex-flow: column;
    height: auto;
  }
`;

export const formContainer = css`
  display: flex;
  flex-direction: column;
  max-width: 500px;
  border-left: 1px solid #f3f2f1;
  padding: 10px 10px 10px 30px;
`;

export const choiceContainer = css`
  display: flex;
  flex-direction: column;
  padding: 10px 30px 10px 10px;
`;

export const dialogWindow = css`
  display: flex;
  flex-direction: column;
  min-height: 254px;
`;

export const dialogWindowMini = css`
  display: flex;
  flex-direction: column;
  width: 552px;
  min-height: 308px;
`;

export const urlPairStyle = css`
  display: flex;
`;

export const textFieldKBNameFromUrl = {
  root: {
    paddingBottom: 20,
    flex: 'auto',
  },
  fieldGroup: {
    flex: 'auto',
  },
};

export const textFieldKBNameFromScratch = {
  root: {
    paddingBottom: 20,
  },
};

export const dropdownStyles: Partial<IDropdownStyles> = {
  root: {
    flex: 'auto',
  },
};

export const textFieldUrl = {
  root: {
    paddingBottom: 12,
    flex: 'auto',
  },
};

export const warning = {
  color: SharedColors.red10,
  fontSize: FontSizes.size10,
};

export const subText = css`
  color: ${NeutralColors.gray130};
  font-size: 14px;
  font-weight: 400;
`;

export const knowledgeBaseStyle = {
  root: {
    color: NeutralColors.gray160,
    fontWeight: '600' as '600',
  },
};

export const urlStackStyle = {
  root: {
    overflowY: 'auto' as 'auto',
    marginBottom: 10,
  },
};

export const header = {
  height: 50,
  marginBottom: 30,
};

export const descriptionStyle = {
  fontSize: 12,
  marginBottom: 25,
};

export const titleStyle = {
  fontSize: 16,
  fontWeight: 600,
  marginBottom: 10,
};

export const resourceDropdown = {
  dropdown: { width: '100%', marginBottom: 10 },
};

export const dialogBodyStyles = {
  height: 464,
  paddingRight: 10,
  '@media screen and (max-width: 960px)': /* 125% zoom */ {
    height: 'auto',
  },
};
