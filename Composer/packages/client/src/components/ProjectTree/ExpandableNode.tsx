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

const summaryStyle = (depth: number, isActive: boolean) => css`
  label: summary;
  display: flex;
  padding-left: ${depth * INDENT_PER_LEVEL + 12}px;
  padding-top: 6px;
  :hover {
    background: ${isActive ? NeutralColors.gray40 : NeutralColors.gray20};
  }
  background: ${isActive ? NeutralColors.gray30 : NeutralColors.white};
`;

const nodeStyle = css`
  margin-top: 2px;
`;

const TRIANGLE_SCALE = 0.6;

const detailsStyle = css`
  &:not([open]) > summary::-webkit-details-marker {
    transform: scaleX(${TRIANGLE_SCALE});
    min-width: 10px;
  }

  &[open] > summary::-webkit-details-marker {
    transform: scaleY(${TRIANGLE_SCALE});
    min-width: 10px;
  }
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
    <div css={nodeStyle} data-testid="dialog">
      <details ref={detailsRef} css={detailsStyle} open={isExpanded}>
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
        <summary
          css={summaryStyle(depth, isActive)}
          data-testid={'summaryTag'}
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyUp={handleKey}
        >
          {summary}
        </summary>
        {children}
      </details>
    </div>
  );
};
