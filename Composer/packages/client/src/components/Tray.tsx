// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import { NeutralColors } from '@uifabric/fluent-theme';
import { IconButton } from 'office-ui-fabric-react/lib/Button';

const containerStyles = (isOpen: boolean, width: number) => css`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  background-color: ${NeutralColors.white};
  width: ${isOpen ? `${width}px` : 0};
  border-left: 1px solid ${NeutralColors.gray30};
  transition: width 0.1s linear;
  overflow-x: hidden;
`;

const contentStyles = css`
  position: relative;
`;

const closeButtonStyles = css`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  position: absolute;
  right: 0;
`;

type TrayProps = {
  isOpen?: boolean;
  width?: number;
  title?: string;
  onDismiss: () => void;
  children: React.ReactNode;
};

export const Tray = ({ isOpen = false, width = 400, onDismiss, title, children }: TrayProps) => {
  return (
    <div css={containerStyles(isOpen, width)}>
      <div css={contentStyles}>
        <div css={closeButtonStyles}>
          <IconButton iconProps={{ iconName: 'Cancel', style: { color: NeutralColors.gray160 } }} onClick={onDismiss} />
        </div>
        <div style={{ minWidth: `${width}px` }}>{children}</div>
      </div>
    </div>
  );
};
