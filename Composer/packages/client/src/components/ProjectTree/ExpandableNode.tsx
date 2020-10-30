// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useState, MouseEvent, KeyboardEvent } from 'react';

type Props = {
  children: React.ReactNode;
  summary: React.ReactNode;
  depth?: number;
  detailsRef?: (el: HTMLElement | null) => void;
};

const summaryStyle = css`
  label: summary;
  display: flex;
  padding-left: 12px;
  padding-top: 6px;
`;

const nodeStyle = (depth: number) => css`
  margin-left: ${depth * 16}px;
`;

export const ExpandableNode = ({ children, summary, detailsRef, depth = 0 }: Props) => {
  const [isExpanded, setExpanded] = useState(true);

  function handleClick(ev: MouseEvent) {
    if ((ev.target as Element)?.tagName.toLowerCase() === 'summary') {
      setExpanded(!isExpanded);
    }
    ev.preventDefault();
  }

  function handleKey(ev: KeyboardEvent) {
    if (ev.key === 'Enter' || ev.key === 'Space') setExpanded(!isExpanded);
  }

  return (
    <div css={nodeStyle(depth)} data-testid="dialog">
      <details ref={detailsRef} open={isExpanded}>
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
        <summary css={summaryStyle} role="button" tabIndex={0} onClick={handleClick} onKeyUp={handleKey}>
          {summary}
        </summary>
        {children}
      </details>
    </div>
  );
};
