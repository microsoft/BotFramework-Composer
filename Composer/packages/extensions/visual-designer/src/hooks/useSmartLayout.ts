// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useState, useEffect, useMemo } from 'react';

import { Boundary, areBoundariesEqual } from '../models/Boundary';
import { GraphLayout } from '../models/GraphLayout';
import { GraphNode } from '../models/GraphNode';

// T extends string means an Enum. Reference: https://github.com/microsoft/TypeScript/issues/30611#issuecomment-565384924
type MapWithEnumKey<KeyType extends string, ValueType> = { [key in KeyType]: ValueType };
type GraphNodeMap<T extends string> = MapWithEnumKey<T, GraphNode>;
type BoundaryMap<T extends string> = MapWithEnumKey<T, Boundary>;

export function useSmartLayout<T extends string>(
  nodeMap: GraphNodeMap<T>,
  layouter: (nodeMap: GraphNodeMap<T>, boundaryMap: BoundaryMap<T>) => GraphLayout,
  onResize: (boundary: Boundary) => void
): {
  layout: GraphLayout;
  updateNodeBoundary: (nodeName: T, boundary: Boundary) => void;
} {
  const [boundaryMap, setBoundaryMap] = useState<BoundaryMap<T>>({} as BoundaryMap<T>);
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

  const layout = useMemo(() => layouter(nodeMap, boundaryMap), [nodeMap, boundaryMap]);

  useEffect(() => {
    onResize(layout.boundary);
  }, [layout]);

  return {
    layout,
    updateNodeBoundary: patchBoundary,
  };
}
