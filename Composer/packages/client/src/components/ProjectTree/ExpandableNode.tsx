// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, SerializedStyles } from '@emotion/core';
import { useState, MouseEvent, KeyboardEvent } from 'react';

type Props = {
  children: JSX.Element;
  summary: JSX.Element;
  summaryCSS: SerializedStyles;
  ref?: (el: HTMLElement | null) => void;
};

export const ExpandableNode = ({ children, summary, ref, summaryCSS }: Props) => {
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
    <details ref={ref} open={isOpen}>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
      <summary css={summaryCSS} role="button" tabIndex={0} onClick={handleClick} onKeyUp={handleKey}>
        {summary}
      </summary>
      {children}
    </details>
  );
};
