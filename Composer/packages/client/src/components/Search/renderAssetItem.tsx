// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { NeutralColors } from '@uifabric/fluent-theme';
import { DefaultPalette } from '@uifabric/styling';
import Fuse from 'fuse.js';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import React from 'react';

import { renderFuseResult } from './fuseRenderUtils';
import { AssetItem, BotBoundAssetData } from './types';

const ItemText = styled(Text)({
  fontSize: 12,
});

export const renderAssetItem = (itemData: Fuse.FuseResult<AssetItem<BotBoundAssetData>>): React.ReactNode => {
  const nameMatches = itemData.matches?.filter((m) => m.key === 'data.label');
  const pathMatches = itemData.matches?.filter((m) => m.key === 'path');

  const slicedPath: { kind: 'match' | 'string'; data: string[] | Fuse.FuseResultMatch[] }[] = pathMatches?.length
    ? pathMatches.reduce((acc, pm, idx) => {
        if (pm?.refIndex) {
          const startIdx = Math.max(idx - 1, 0);
          acc.push({ kind: 'string', data: itemData.item.path.slice(startIdx, pm.refIndex) });
          acc.push({ kind: 'match', data: [pm] });
          if (idx === pathMatches.length - 1 && pm.refIndex < itemData.item.path.length - 1) {
            acc.push({ kind: 'string', data: itemData.item.path.slice(pm.refIndex + 1) });
          }
        }
        return acc;
      }, [] as { kind: 'match' | 'string'; data: string[] | Fuse.FuseResultMatch[] }[])
    : [{ kind: 'string', data: itemData.item.path }];

  return (
    <Stack
      horizontal
      styles={{ root: { overflowX: 'hidden' } }}
      title={`${itemData.item.data.label}[${itemData.item.path.join('>')}]`}
      tokens={{ childrenGap: 8 }}
      verticalAlign="center"
    >
      {nameMatches?.length ? (
        renderFuseResult(nameMatches, {
          matchedStyle: { color: DefaultPalette.black, fontWeight: 600 },
          normalStyle: {},
        })
      ) : (
        <ItemText>{itemData.item.data.label}</ItemText>
      )}
      <Stack.Item
        styles={{
          root: {
            flex: 1,
            overflowX: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginTop: -1,
            color: NeutralColors.gray90,
          },
        }}
      >
        {pathMatches?.length ? (
          slicedPath?.reduce((acc, p, idx) => {
            if (p.kind === 'string') {
              acc.push(<ItemText styles={{ root: { color: NeutralColors.gray90 } }}>{p.data.join(' > ')}</ItemText>);
            } else {
              acc.push(
                <ItemText styles={{ root: { color: NeutralColors.gray90 } }}>&nbsp;&gt;&nbsp;</ItemText>,
                renderFuseResult(p.data as Fuse.FuseResultMatch[], {
                  matchedStyle: { color: DefaultPalette.black },
                  normalStyle: { color: NeutralColors.gray90 },
                })
              );

              if (idx !== slicedPath.length - 1) {
                acc.push(<ItemText styles={{ root: { color: NeutralColors.gray90 } }}>&nbsp;&gt;&nbsp;</ItemText>);
              }
            }
            return acc;
          }, [] as React.ReactNode[])
        ) : (
          <ItemText styles={{ root: { color: NeutralColors.gray90 } }}>{itemData.item.path}</ItemText>
        )}
      </Stack.Item>
    </Stack>
  );
};
