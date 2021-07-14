// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useState, useRef, useEffect } from 'react';
import formatMessage from 'format-message';

import { Link } from './Link';

const styles = {
  body: (maxLines = 5, isExpanded = false) => css`
    overflow-wrap: break-word;
    // https://css-tricks.com/line-clampin/#weird-webkit-flexbox-way
    ${!isExpanded
      ? `
      overflow: hidden;
      max-height: ${maxLines * 16}px;
      display: -webkit-box;
      -webkit-line-clamp: ${maxLines};
      -webkit-box-orient: vertical;
      `
      : undefined}
  `,
  showMore: css`
    display: flex;
    justify-content: flex-end;
    margin-top: 5px;
  `,
};

type ExpandableTextProps = {
  /**
   * Number of lines allowed before truncation.
   * @default 5
   */
  maxLines?: number;
  /**
   * Optional class name to pass to child wrapper.
   */
  className?: string;
  /**
   * Text to truncate if necessary.
   */
  children?: string;
};

const ExpandableText = ({ maxLines = 5, className, children }: ExpandableTextProps) => {
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const childRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const el = childRef.current;
    setNeedsTruncation(Boolean(el && el.scrollHeight > el.clientHeight));
  }, [children]);

  return (
    <React.Fragment>
      <p
        ref={childRef}
        className={className}
        css={styles.body(maxLines, expanded)}
        data-istruncated={needsTruncation && !expanded}
        data-testid="ExpandableTextContent"
      >
        {children}
      </p>
      {needsTruncation && (
        <div css={styles.showMore}>
          <Link styles={{ root: { fontSize: '12px' } }} onClick={() => setExpanded((current) => !current)}>
            {expanded ? formatMessage('Show Less') : formatMessage('Show More')}
          </Link>
        </div>
      )}
    </React.Fragment>
  );
};

export { ExpandableText };
