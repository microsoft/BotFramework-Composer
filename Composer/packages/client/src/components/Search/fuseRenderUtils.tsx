// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import Fuse from 'fuse.js';
import { Text } from 'office-ui-fabric-react/lib/Text';
import React from 'react';

const renderFuseMatch = (
  match: Fuse.FuseResultMatch,
  segmentIndex: number,
  styles: {
    normalStyle: React.CSSProperties;
    matchedStyle: React.CSSProperties;
  }
): JSX.Element => {
  const indices = match.indices
    .slice()
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0))
    .reduce((acc, range) => {
      if (!acc.length) {
        acc.push(range);
        return acc;
      }
      const lastRange = acc[acc.length - 1];
      if (lastRange[1] >= range[0]) {
        return acc;
      }
      acc.push(range);
      return acc;
    }, [] as Fuse.RangeTuple[]);

  let firstIndex = 0;
  const lastIndex = match.value?.length;

  const items = indices.map((m, spanIndex) => {
    const firstSpan = <span style={styles.normalStyle}>{match.value?.slice(firstIndex, m[0])}</span>;
    const secondSpan = <span style={styles.matchedStyle}>{match.value?.slice(m[0], m[1] + 1)}</span>;

    firstIndex = m[1] + 1;
    return (
      <React.Fragment key={`segment-${segmentIndex}-span-${spanIndex}`}>
        {firstSpan}
        {secondSpan}
      </React.Fragment>
    );
  });

  items.push(
    <span key={`segment-${segmentIndex}-span-final`} style={styles.normalStyle}>
      {match.value?.slice(firstIndex, lastIndex)}
    </span>
  );

  return <React.Fragment key={`segment-${segmentIndex}`}>{items}</React.Fragment>;
};

export const renderFuseResult = (
  matches: readonly Fuse.FuseResultMatch[],
  styles: { normalStyle: React.CSSProperties; matchedStyle: React.CSSProperties }
): JSX.Element => {
  return <Text styles={{ root: { fontSize: 12 } }}>{matches.map((m, i) => renderFuseMatch(m, i, styles))}</Text>;
};
