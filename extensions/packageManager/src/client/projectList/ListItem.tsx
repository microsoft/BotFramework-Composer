// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import { Icon } from 'office-ui-fabric-react';
import { NeutralColors } from '@uifabric/fluent-theme';

import { ListLink } from './ProjectList';

// -------------------- Styles -------------------- //

const navItem = (isActive: boolean, padLeft: number) => css`
  label: navItem;
  position: relative;
  height: 24px;
  font-size: 12px;
  font-weight: 600;
  padding-left: ${padLeft}px;
  color: '#545454';
  background: ${isActive ? 'rgb(243, 242, 241)' : 'transparent'};

  display: flex;
  flex-direction: row;
  align-items: center;

  &:focus {
    outline: rgb(102, 102, 102) solid 1px;
    z-index: 1;
    .ms-Fabric--isFocusVisible &::after {
      top: 0px;
      right: 1px;
      bottom: 0px;
      left: 1px;
      content: '';
      position: absolute;
      z-index: 1;
      border: 1px solid ${NeutralColors.white};
      border-image: initial;
      outline: rgb(102, 102, 102) solid 1px;
    }
  }
`;

export const overflowSet = css`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  line-height: 24px;
  justify-content: space-between;
  display: flex;
`;

const itemName = (nameWidth: number) => css`
  max-width: ${nameWidth}px;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
`;

// -------------------- ListItem -------------------- //

interface Props {
  link: ListLink;
  isActive?: boolean;
  icon?: string;
  onSelect?: (link: ListLink) => void;
  textWidth?: number;
  padLeft?: number;
}

export const ListItem: React.FC<Props> = ({
  link,
  isActive = false,
  icon,
  onSelect,
  textWidth = 100,
  padLeft = 16,
}) => {
  const linkString = `${link.projectId}_ListItem`;

  return (
    <div
      key={linkString}
      data-is-focusable
      aria-label={`${link.displayName}`}
      css={navItem(isActive, padLeft)}
      role="cell"
      tabIndex={0}
      onClick={() => {
        onSelect?.(link);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onSelect?.(link);
        }
      }}
    >
      {icon != null && (
        <Icon
          iconName={icon}
          styles={{
            root: {
              width: '12px',
              marginRight: '8px',
              outline: 'none',
            },
          }}
          tabIndex={-1}
        />
      )}
      <span css={itemName(textWidth)}>{link.displayName}</span>
    </div>
  );
};
