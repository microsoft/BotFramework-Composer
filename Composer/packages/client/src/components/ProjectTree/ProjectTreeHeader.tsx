// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { FontSizes, NeutralColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { IButtonStyles, IconButton } from 'office-ui-fabric-react/lib/Button';

const headerText = css`
  text-align: left;
  margin: 0;
  padding: 6px 0 6px 12px;
  text-transform: uppercase;
  font-size: ${FontSizes.size12};
  position: relative;
`;

const buttonStyles: IButtonStyles = {
  icon: {
    color: NeutralColors.black,
    fontSize: FontSizes.size12,
  },
  root: {
    height: '20px',
    width: '20px',
    position: 'absolute',
    right: '6px',
    top: '3px',
  },
  rootHovered: {
    backgroundColor: 'transparent',
  },
  rootPressed: {
    backgroundColor: 'transparent',
  },
};

const headerWrapper = css`
  background: ${NeutralColors.gray60};
`;

export const ProjectTreeHeader = () => {
  return (
    <div css={headerWrapper}>
      <p css={headerText}>
        <span>{formatMessage('your project')}</span>
        <IconButton iconProps={{ iconName: 'Add' }} styles={buttonStyles} title={formatMessage('Connect to skill')} />
      </p>
    </div>
  );
};
