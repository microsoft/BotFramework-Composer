// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { FontSizes, FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { SharedColors, NeutralColors } from '@uifabric/fluent-theme';

// Styles

export const titleStyle = css`
  font-size: ${FontSizes.medium};
  font-weight: ${FontWeights.semibold};
  margin-left: 22px;
  margin-top: 6px;
`;

const labelContainer = css`
  display: flex;
  flex-direction: row;
`;

const customerLabel = css`
  font-size: ${FontSizes.small};
  margin-right: 5px;
`;

const unknownIconStyle = (required) => {
  return {
    root: {
      selectors: {
        '&::before': {
          content: required ? " '*'" : '',
          color: SharedColors.red10,
          paddingRight: 3,
        },
      },
    },
  };
};

export const sectionHeader = css`
  color: ${NeutralColors.gray130};
  font-size: ${FontSizes.smallPlus};
  & > h1 {
    margin-top: 0;
  }
`;

export const tableRow = css`
  display: flex;
  flex-direction: row;
  height: 42px;
`;

export const tableItem = css`
  width: 200px;
  font-size: ${FontSizes.medium};
  font-weight: ${FontWeights.regular};
  border-bottom: 1px solid ${NeutralColors.gray30};
  padding-top: 10px;
  padding-left: 10px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

// Functions

export function onRenderLabel(props: { label?: string; required?: boolean } | undefined) {
  if (props == null) return null;
  const { label, required } = props;

  return (
    <div css={labelContainer}>
      <div css={customerLabel}> {label} </div>
      <TooltipHost content={label}>
        <Icon iconName="Unknown" styles={unknownIconStyle(required)} />
      </TooltipHost>
    </div>
  );
}
