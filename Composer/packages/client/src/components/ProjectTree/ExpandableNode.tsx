// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, MouseEvent, KeyboardEvent } from 'react';

type Props = {
  children: JSX.Element;
  summary: JSX.Element;
  summaryCSS: any;
  ref?: any;
};

export const ExpandableNode = ({ children, summary, ref, summaryCSS }: Props) => {
  const [isOpen, setOpen] = useState(true);

  function handleClick(ev: MouseEvent) {
    if ((ev.target as Element)?.tagName.toLowerCase() === 'summary') {
      setOpen(!isOpen);
    }
  }

  function handleKey(ev: KeyboardEvent) {
    if (ev.key === 'Enter' || ev.key === 'Space') setOpen(!isOpen);
  }

  return (
    <details ref={ref} open={isOpen} tabIndex={0} onClick={handleClick} onKeyUp={handleKey}>
      <summary css={summaryCSS}>{summary}</summary>
      {children}
    </details>
  );
};
