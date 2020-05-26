// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useState, useEffect, useMemo } from 'react';

import { Boundary, areBoundariesEqual } from '../models/Boundary';
import { GraphLayout } from '../models/GraphLayout';
import { GraphNode } from '../models/GraphNode';

// 'T extends string' means an Enum. Reference: https://github.com/microsoft/TypeScript/issues/30611#issuecomment-565384924
type MapWithEnumKey<KeyType extends string, ValueType> = { [key in KeyType]: ValueType };

type BoundaryMap<T extends string> = MapWithEnumKey<T, Boundary>;

export type GraphNodeMap<T extends string> = MapWithEnumKey<T, GraphNode>;

export function useSmartLayout<T extends string>(
  nodeMap: GraphNodeMap<T>,
  layouter: (nodeMap: GraphNodeMap<T>) => GraphLayout,
  onResize: (boundary: Boundary) => void
): {
  layout: GraphLayout;
  updateNodeBoundary: (nodeName: T, boundary: Boundary) => void;
} {
  const [boundaryMap, setBoundaryMap] = useState<BoundaryMap<T>>({} as BoundaryMap<T>);
  /**
   * The object `accumulatedPatches` is used to collect all accumulated
   *  boundary changes happen in a same JS event cyle. After collecting
   *  them together, they will be submitted to component states to guide
   *  next redraw.
   *
   * We shouldn't use `setState()` here because of `patchBoundary` may be
   *  fired multiple times (especially at the init render cycle), changes
   *  will be lost by using `setState()`;
   *
   * We shouldn't use `useRef` here since `accumulatedPatches` as a local
   *  cache needs to be cleared after taking effect in one redraw.
   */
  const accumulatedPatches = {};
  const patchBoundary = (nodeName: string, boundary: Boundary) => {
    if (!boundaryMap[nodeName] || !areBoundariesEqual(boundaryMap[nodeName], boundary)) {
      accumulatedPatches[nodeName] = boundary;
      setBoundaryMap({
        ...boundaryMap,
        ...accumulatedPatches,
      });
    }
  };

  const layout = useMemo(() => {
    // write updated boundaries to nodes
    Object.keys(nodeMap).map(nodeName => {
      const node = nodeMap[nodeName];
      if (node) {
        node.boundary = boundaryMap[nodeName] || node.boundary;
      }
    });
    return layouter(nodeMap);
  }, [nodeMap, boundaryMap]);

  useEffect(() => {
    onResize && onResize(layout.boundary);
  }, [layout]);

  return {
    layout,
    updateNodeBoundary: patchBoundary,
  };
}
