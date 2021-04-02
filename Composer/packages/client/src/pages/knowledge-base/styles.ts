// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { css } from '@emotion/core';
import { FontWeights, mergeStyleSets } from '@uifabric/styling';
import { NeutralColors, SharedColors, FontSizes } from '@uifabric/fluent-theme';
import { IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { ITextFieldStyles } from 'office-ui-fabric-react/lib/TextField';

export const classNames = mergeStyleSets({
  groupHeader: {
    display: 'flex',
    fontSize: FontSizes.size16,
    fontWeight: FontWeights.regular,
    alignItems: 'center',
  },
  emptyTableList: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  emptyTableListCenter: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    width: '50%',
    textAlign: 'center',
  },
});

export const content = css`
  min-height: 28px;
  outline: none;
`;

export const contentAnswer = (showAll: boolean) => css`
  text-overflow: ellipsis;
  height: ${showAll ? 'auto' : '28px'};
  outline: none;
`;

export const formCell = css`
  display: flex;
  flex-direction: column;
  outline: none;
  :focus {
    outline: rgb(102, 102, 102) solid 1px;
  }
  white-space: pre-wrap;
  font-size: 14px;
  line-height: 28px;
  height: 100%;
`;

export const inlineContainer = (isBold) => css`
  font-weight: ${isBold ? FontWeights.semibold : 400};
`;

export const textFieldQuestion = {
  root: {
    height: 28,
    marginLeft: -5,
  },
  field: {
    paddingLeft: 4,
    marginTop: -5,
  },
};

export const textFieldAnswer = {
  root: {
    minHeight: 28,
    marginLeft: -5,
    marginTop: -1,
  },
  field: {
    lineHeight: 28,
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 4,
  },
};

export const divider = css`
  height: 1px;
  background: ${NeutralColors.gray30};
`;

export const rowDetails = {
  root: {
    minHeight: 40,
    width: '100%',
    selectors: {
      '.ms-GroupHeader-expand': {
        fontSize: 8,
      },
      '&:hover': {
        background: NeutralColors.gray30,
        selectors: {
          '.ms-TextField-fieldGroup': {
            background: NeutralColors.gray30,
          },
          '.ms-Button--icon': {
            visibility: 'visible',
          },
          '.ms-Button': {
            display: 'block',
          },
        },
      },
      '&.is-selected': {
        selectors: {
          '.ms-Button--icon': {
            visibility: 'visible',
          },
          '.ms-Button': {
            visibility: 'visible',
          },
          '.ms-TextField-fieldGroup': {
            background: NeutralColors.gray30,
          },
        },
      },
      '&.is-selected:hover': {
        background: NeutralColors.gray30,
      },
    },
  },
};

export const icon = {
  root: {
    color: NeutralColors.black,
    visibility: 'hidden',
  },
};

export const addAlternative = {
  root: {
    fontSize: 12,
    paddingLeft: 0,
    marginLeft: -5,
    color: SharedColors.cyanBlue10,
    display: 'none',
  },
} as IButtonStyles;

export const addQnAPair = {
  root: {
    fontSize: 12,
    paddingLeft: 0,
    marginLeft: 57,
    marginTop: -10,
    color: SharedColors.cyanBlue10,
  },
};

export const addIcon = {
  root: {
    fontSize: FontSizes.size10,
    margin: 0,
    color: SharedColors.cyanBlue10,
  },
};

export const backIcon = {
  root: {
    fontSize: FontSizes.size16,
    color: NeutralColors.black,
    marginTop: -10,
    marginBottom: 10,
  },
  icon: {
    fontSize: FontSizes.size12,
    marginTop: 2,
    color: NeutralColors.black,
  },
};

export const editableField: Partial<ITextFieldStyles> = {
  root: {
    height: '100%',
    selectors: {
      '.ms-TextField-wrapper': {
        height: '100%',
      },
    },
  },
  fieldGroup: {
    height: '100%',
    border: '0',
    selectors: {
      '&.ms-TextField-fieldGroup': {
        selectors: {
          '::after': {
            border: 'none !important',
          },
        },
      },
    },
  },
  field: {
    overflow: 'hidden',
    fontSize: FontSizes.size12,
    maxHeight: 500,
    textOverflow: 'ellipsis',
    paddingRight: '1rem',
    selectors: {
      '::placeholder': {
        fontSize: FontSizes.size12,
      },
    },
  },
};

export const groupHeader = {
  root: {
    selectors: {
      '.ms-GroupHeader-expand': {
        fontSize: 8,
        marginLeft: 16,
      },
    },
  },
};

export const groupNameStyle = css`
  margin-top: -5px;
  margin-left: 8px;
  font-size: ${FontSizes.size16};
  font-weight: ${FontWeights.semibold};
`;

export const detailsHeaderStyle = css`
  .ms-TooltipHost {
    background: ${NeutralColors.white};
  }
`;
