// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useState, MouseEvent, KeyboardEvent } from 'react';
import { NeutralColors } from '@uifabric/fluent-theme';

import { INDENT_PER_LEVEL } from './constants';

type Props = {
  children: React.ReactNode;
  summary: React.ReactNode;
  depth?: number;
  detailsRef?: (el: HTMLElement | null) => void;
  onToggle?: (newState: boolean) => void;
  defaultState?: boolean;
  isActive?: boolean;
};

const summaryStyle = (depth: number, isActive: boolean, isOpen: boolean) => css`
  label: summary;
  padding-left: ${depth * INDENT_PER_LEVEL + 12}px;
  padding-top: 6px;
  display: list-item;
  :hover {
    background: ${isActive ? NeutralColors.gray40 : NeutralColors.gray20};
  }
  background: ${isActive ? NeutralColors.gray30 : NeutralColors.white};
  ${isOpen
    ? `list-style-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8' standalone='no'%3F%3E%3Csvg xmlns='http://www.w3.org/2000/svg' version='1.1' height='10' width='10' viewBox='0 0 16 16'%3E%3Cpath style='fill:black;' d='M 0 8 H 16 L 8 16 L 0 8'/%3E%3C/svg%3E");`
    : `list-style-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8' standalone='no'%3F%3E%3Csvg xmlns='http://www.w3.org/2000/svg' version='1.1' height='10' width='10' viewBox='0 0 16 16'%3E%3Cpath style='fill:black;' d='M 8 0 V 16 L 16 8 L 8 0'/%3E%3C/svg%3E");`}
`;

const nodeStyle = css`
  margin-top: 2px;
`;

export const ExpandableNode = ({
  children,
  summary,
  detailsRef,
  depth = 0,
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
    if ((ev.target as Element)?.tagName.toLowerCase() === 'summary') {
      setExpandedWithCallback(!isExpanded);
    }
    ev.preventDefault();
  }

  function handleKey(ev: KeyboardEvent) {
    if (ev.key === 'Enter' || ev.key === 'Space') setExpandedWithCallback(!isExpanded);
  }

  return (
    <details
      ref={detailsRef}
      aria-expanded={isExpanded}
      css={nodeStyle}
      data-testid="dialog"
      open={isExpanded}
      role="tree"
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
      <summary
        css={summaryStyle(depth, isActive, isExpanded)}
        data-testid={'summaryTag'}
        tabIndex={0}
        onClick={handleClick}
        onKeyUp={handleKey}
      >
        {summary}
      </summary>
      <div role="group">{children}</div>
    </details>
  );
};
