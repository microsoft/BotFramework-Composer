// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, MouseEvent, KeyboardEvent } from 'react';

import { summaryStyle } from './styles';

type Props = {
  children: React.ReactNode;
  summary: React.ReactNode;
  depth?: number;
  detailsRef?: (el: HTMLElement | null) => void;
  onToggle?: (newState: boolean) => void;
  defaultState?: boolean;
  isActive?: boolean;
};

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
    <div data-testid="dialog">
      <details ref={detailsRef} open={isExpanded}>
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
        <summary
          css={summaryStyle(depth, isActive, isExpanded)}
          data-testid={'summaryTag'}
          role="treegrid"
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
