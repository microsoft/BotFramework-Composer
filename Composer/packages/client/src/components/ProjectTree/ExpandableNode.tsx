// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useState, MouseEvent, KeyboardEvent } from 'react';
import { NeutralColors } from '@uifabric/fluent-theme';

type Props = {
  children?: React.ReactNode;
  summary: React.ReactNode;
  depth?: number;
  detailsRef?: (el: HTMLElement | null) => void;
  onToggle?: (newState: boolean) => void;
  defaultState?: boolean;
  isActive?: boolean;
};

const listItemStyle = (isActive: boolean, isOpen: boolean, hasChildren: boolean) => css`
  label: listItem;
  :hover {
    background: ${isActive ? NeutralColors.gray40 : NeutralColors.gray20};
  }
  background: ${isActive ? NeutralColors.gray30 : NeutralColors.white};
  ${!hasChildren
    ? 'list-style: none'
    : isOpen
    ? `list-style-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8' standalone='no'%3F%3E%3Csvg xmlns='http://www.w3.org/2000/svg' version='1.1' height='16' width='16' viewBox='0 0 24 16'%3E%3Cpath style='fill:black%3B' d='M 8 8 h 16 l -8 8 l -8 -8'/%3E%3C/svg%3E");`
    : `list-style-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8' standalone='no'%3F%3E%3Csvg xmlns='http://www.w3.org/2000/svg' version='1.1' height='16' width='16' viewBox='0 0 24 16'%3E%3Cpath style='fill:black%3B' d='M 16 0 v 16 l 8 -8 l -8 -8'/%3E%3C/svg%3E");`}
`;

const listStyle = css`
  label: list;
  margin-top: 0;
  margin-left: 16px;
  padding-inline-start: 6px;
  margin-block-end: 0px;
`;

export const ExpandableNode = ({
  children,
  summary,
  detailsRef,
  onToggle,
  defaultState = true,
  isActive = false,
}: Props) => {
  const [isExpanded, setExpanded] = useState(defaultState);

  function setExpandedWithCallback(newState: boolean) {
    setExpanded(newState);
    onToggle?.(newState);
  }

  function handleClick(ev: MouseEvent) {
    const target = ev.target as Element;
    if (target.tagName.toLowerCase() === 'li') {
      setExpandedWithCallback(!isExpanded);
      ev.stopPropagation();
    }
    ev.preventDefault();
  }

  function handleKey(ev: KeyboardEvent) {
    if (ev.key === 'Enter' || ev.key === 'Space') setExpandedWithCallback(!isExpanded);
  }

  return (
    <ul
      ref={detailsRef}
      aria-expanded={isExpanded}
      css={listStyle}
      data-testid="dialog"
      role="tree"
      onClick={handleClick}
      onKeyDown={handleKey}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
      <li css={listItemStyle(isActive, isExpanded, children != null)} data-testid={'summaryTag'}>
        {summary}
      </li>
      {children != null && isExpanded && <div role="group">{children}</div>}
    </ul>
  );
};
