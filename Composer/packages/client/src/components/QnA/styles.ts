// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { css } from '@emotion/core';
import { FontWeights } from '@uifabric/styling';
import { FontSizes, SharedColors, NeutralColors } from '@uifabric/fluent-theme';
import { IDropdownStyles } from 'office-ui-fabric-react/lib/Dropdown';

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
      maxWidth: '960px !important',
      width: '960px',
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

const fieldGroupWidth = 500;

export const textFieldKBNameFromUrl = {
  root: {
    paddingBottom: 20,
  },
  fieldGroup: {
    width: fieldGroupWidth,
  },
};

export const textFieldKBNameFromScratch = {
  root: {
    paddingBottom: 20,
  },
  fieldGroup: {
    width: fieldGroupWidth,
  },
};

export const dropdownStyles: Partial<IDropdownStyles> = {
  dropdown: { width: fieldGroupWidth },
};

export const textFieldLocales = {
  root: {
    width: 115,
    marginRight: 20,
    paddingBottom: 20,
    selectors: {
      '.ms-Label': {
        color: NeutralColors.gray160,
      },
    },
  },
};

export const textFieldUrl = {
  root: {
    paddingBottom: 12,
  },
  fieldGroup: {
    width: fieldGroupWidth,
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
  marginBottom: 20,
};

export const descriptionStyle = {
  fontSize: 12,
};

export const titleStyle = {
  fontSize: 16,
  fontWeight: 600,
  marginBottom: 10,
};

export const replaceWithQnAportalHeader = {
  width: 500,
};
