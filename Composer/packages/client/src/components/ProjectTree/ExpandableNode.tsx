// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useState, MouseEvent, KeyboardEvent } from 'react';

type Props = {
  children: JSX.Element;
  summary: JSX.Element;
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
  const [isOpen, setOpen] = useState(true);

  function handleClick(ev: MouseEvent) {
    if ((ev.target as Element)?.tagName.toLowerCase() === 'summary') {
      setOpen(!isOpen);
    }
    ev.preventDefault();
  }

  function handleKey(ev: KeyboardEvent) {
    if (ev.key === 'Enter' || ev.key === 'Space') setOpen(!isOpen);
  }

  return (
    <div css={nodeStyle(depth)}>
      <details ref={detailsRef} open={isOpen}>
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
        <summary css={summaryStyle} role="button" tabIndex={0} onClick={handleClick} onKeyUp={handleKey}>
          {summary}
        </summary>
        {children}
      </details>
    </div>
  );
};
