import * as Dagre from 'dagre';
import { BoundingBox, Coord2d, StringMap } from './GraphSchemas';

// NOTE(lin): In the context of hierarchical graphs, RankGroup represents the collection of nodes in the same rank, i.e. the same level.
// "flexSpan" and "alignSpan" discribes the flex-direction and align-direction measurements of the BBox (bounding box) of the rank.
// With the vertical graph flex, "flexSpan" is the height of the BBox and is determined by the highest node, while "alignSpan" is the width of the BBox
// and is determined by the total widths of all nodes plus their gaps in between. Likewise for the horizontal flex.
interface RankGroup {
  rank: number;
  nodeIds: string[];
  flexSpan: number;
  alignSpan: number;
}

interface RankingResult {
  rankMap: StringMap<number>;
  rankList: RankGroup[];
}

export type NodeAlignmentStyle = 'Compact' | 'Symmetric';

export interface LayoutOptions {
  nodeAlignmentStyle: NodeAlignmentStyle;
  marginOffsetTopLeft: Coord2d;
}

// NOTE(lin): SimpleFlex is a hierachical multi-edge graph layout algorithm that aims to optimize for the following constraints:
// 1. Stability across continual edits. Adding or removing a node or edge should not cause the global layout to change substantially.
// 2. Compactness. The (node size)/(screen size) ratio is assumed large, and we trade off minimal edge crossing for efficient screen real estate usage.
// 3. TODO(lin): Fixed, ordered edge outlets. Edges don't leave or enter nodes from arbitrary points on a node; they attach to specific outlets.
// 4. Performance. Various heuristics are adopted instead of their optimal counterparts that require potentially non-realtime computation.
export function layout(layoutGraph: Dagre.graphlib.Graph, options?: LayoutOptions): BoundingBox {
  if (layoutGraph.nodes().length === 0) {
    return;
  }

  if (!options) {
    options = {
      nodeAlignmentStyle: 'Symmetric',
      marginOffsetTopLeft: {
        x: 0,
        y: 0,
      },
    };
  }

  // Step 1: Ranking, i.e. finding out which level a node belongs in the hierarchy.
  const { rankMap, rankList } = rankNodes(layoutGraph);
  const ancestorMap = computeAncestorMap(rankList, rankMap, layoutGraph);

  // Step 2: Sorting nodes within each rank. The graph stability is based on the sorting stability here.
  sortNodes(rankList, layoutGraph, ancestorMap);

  // Step 3: Assign coordinates to nodes.
  const allNodesBoundingBox: BoundingBox = {
    topLeft: {
      ...options.marginOffsetTopLeft,
    },
    bottomRight: {
      x: 0,
      y: 0,
    },
  };

  positionNodes(rankList, layoutGraph, ancestorMap, allNodesBoundingBox, options);

  return allNodesBoundingBox;
}

function rankNodes(layoutGraph: Dagre.graphlib.Graph): RankingResult {
  const sourceNodeIds: string[] = layoutGraph.sources() as any;
  if (sourceNodeIds.length === 0) {
    sourceNodeIds.push(layoutGraph.nodes()[0]);
  }

  const rankMap: StringMap<number> = {};
  sourceNodeIds.forEach(id => rankLane(id, rankMap, layoutGraph));

  const rankList = groupByRank(rankMap, layoutGraph);

  return {
    rankMap,
    rankList,
  };
}

// NOTE(lin): Imagine that each source node, i.e. those nodes without parents, branches out into its own "sub-tree",
// and each "sub-tree" is placed into separate "swim lanes", for a clean visual seperation.
// In each lane, we do a DFS to rank the source node and its descendents.
function rankLane(laneStartNodeId: string, rankMap: StringMap<number>, layoutGraph: Dagre.graphlib.Graph): void {
  const visitedIds = new Set<string>();
  dfsRank(laneStartNodeId, 0, rankMap, layoutGraph, visitedIds);
}

function dfsRank(
  currentId: string,
  currentRank: number,
  rankMap: StringMap<number>,
  layoutGraph: Dagre.graphlib.Graph,
  visitedIds: Set<string>
): void {
  if (visitedIds.has(currentId)) {
    // NOTE(lin): A loop is detected; the current id has already been ranked.
    return;
  }

  if (!rankMap[currentId] || rankMap[currentId] < currentRank) {
    rankMap[currentId] = currentRank;
  }

  visitedIds.add(currentId);

  const nextIds: string[] = layoutGraph.successors(currentId) as any;
  nextIds.forEach(id => dfsRank(id, currentRank + 1, rankMap, layoutGraph, visitedIds));

  visitedIds.delete(currentId);
}

// NOTE(lin): Nodes within a rank are sorted successively; sorting RankList[i] requires RankList[i-1] to have been sorted.
// Nodes in the first rank assume their default order.
// For nodes 'A' and 'B' in RankList[i], we look for a preceding rank containing parents of both. Such a rank provides a basis for comparison.
// The basis rank is usually RankList[i-1], especially for tree-like topologies, but not necessarily when loops exist -- example: P->S, P->A, P->B, A->B, B->A,
// where Rank(P)=0, Rank(S)=1, Rank(A)=Rank(B)=2. The basis rank for 'A' and 'B' are 0, where 'P' sits, not 1.
// If their parents in the basis rank are different, the relative order of their respective parents determines the order of 'A' and 'B'.
// If 'A' and 'B' share the same set of parents, then the relative order of their respective routes determines the order.
function sortNodes(
  rankList: RankGroup[],
  layoutGraph: Dagre.graphlib.Graph,
  ancestorMap: StringMap<Set<string>>
): void {
  for (const currentGroup of rankList) {
    if (currentGroup.rank === 0) {
      // NOTE(lin): It's possible that edge crossing can be reduced by sorting the the first rank non-trivially. For example, we could have run multiple passes of this sorting method
      // on different permutations of the first rank and picked the best pass. This is an opportunity to reduce crossing, at the potential cost of speed and stability.
      continue;
    }

    const currentGroupIndex = rankList.findIndex(group => group.rank === currentGroup.rank);
    currentGroup.nodeIds.sort((node0, node1) =>
      sortByBasisRank(node0, node1, currentGroupIndex, rankList, layoutGraph, ancestorMap)
    );
  }
}

function sortByBasisRank(
  node0: string,
  node1: string,
  currentGroupIndex: number,
  rankList: RankGroup[],
  layoutGraph: Dagre.graphlib.Graph,
  ancestorMap: StringMap<Set<string>>
): number {
  const ancestors0 = ancestorMap[node0];
  const ancestors1 = ancestorMap[node1];
  let basisOrders0: number[];
  let basisOrders1: number[];

  for (let i = currentGroupIndex - 1; i >= 0; i--) {
    const group = rankList[i];
    basisOrders0 = [];
    basisOrders1 = [];
    let order = 0;

    for (const parent of group.nodeIds) {
      if (ancestors0.has(parent)) {
        basisOrders0.push(order);
      }

      if (ancestors1.has(parent)) {
        basisOrders1.push(order);
      }

      order++;
    }

    if (basisOrders0.length > 0 && basisOrders1.length > 0) {
      break;
    }
  }

  if (basisOrders0.length === 0 || basisOrders1.length === 0) {
    throw new Error('Could not find basis rank group.');
  }

  const median0 = getMedianFromSortedNumbers(basisOrders0);
  const median1 = getMedianFromSortedNumbers(basisOrders1);
  // TODO(lin): Optimization opportunity: If median0 equals median1, and the basis parents are exactly the same, then compare the edge outlets.
  return median0 - median1;
}

function positionNodes(
  rankList: RankGroup[],
  layoutGraph: Dagre.graphlib.Graph,
  ancestorMap: StringMap<Set<string>>,
  bbox: BoundingBox,
  options: LayoutOptions
): void {
  let flexDirectionOffset = 0;
  let indexWithMaxAlignSpan = 0;
  let maxAlignSpan = 0;

  rankList.forEach((rankGroup, index) => {
    flexDirectionOffset = assignCompactCoords(rankGroup, layoutGraph, flexDirectionOffset);

    if (rankGroup.alignSpan > maxAlignSpan) {
      maxAlignSpan = rankGroup.alignSpan;
      indexWithMaxAlignSpan = index;
    }
  });

  if (options.nodeAlignmentStyle === 'Symmetric') {
    alignCoords(indexWithMaxAlignSpan, rankList, layoutGraph, ancestorMap);
  }

  const { x, y } = options.marginOffsetTopLeft;

  if (x !== 0 || y !== 0) {
    layoutGraph.nodes().forEach(nodeId => {
      const node = layoutGraph.node(nodeId);
      node.x += x;
      node.y += y;

      const xBound = node.x + node.width * 0.5;
      if (xBound > bbox.bottomRight.x) {
        bbox.bottomRight.x = xBound;
      }

      const yBound = node.y + node.height * 0.5;
      if (yBound > bbox.bottomRight.y) {
        bbox.bottomRight.y = yBound;
      }
    });
  }
}

function assignCompactCoords(
  rankGroup: RankGroup,
  layoutGraph: Dagre.graphlib.Graph,
  flexDirectionOffset: number
): number {
  const graphLabel = layoutGraph.graph();
  const { marginx: marginLeft, marginy: marginTop, ranksep: rankSeperation, nodesep: nodeSeperation } = graphLabel;
  const isVerticalFlex = graphLabel.rankdir === 'TB';
  const flexOffset = flexDirectionOffset + (isVerticalFlex ? marginTop : marginLeft);
  let alignOffset = isVerticalFlex ? marginLeft : marginTop;

  rankGroup.nodeIds.forEach(id => {
    const node = layoutGraph.node(id);
    const x = (isVerticalFlex ? alignOffset : flexOffset) + node.width / 2;
    const y = (isVerticalFlex ? flexOffset : alignOffset) + node.height / 2;
    layoutGraph.setNode(id, {
      ...node,
      x,
      y,
    });

    alignOffset += (isVerticalFlex ? node.width : node.height) + nodeSeperation;
  });

  return flexDirectionOffset + rankGroup.flexSpan + rankSeperation;
}

// NOTE(lin): This step assumes the nodes have been assigned coordinates and tightly packed together.
// Now, while maintaining the order of nodes within a rank, we'll adjust their coordinates such that the resulting graph is sparse,
// and the parent-children alignment is more symmetric.
// Take a vertically flexed graph for example. We first identify the widest rank as the initial "reference rank".
// For the nodes in the preceding rank ("adjustment" rank), we iterate from right to left, and for each node, we calculate its optimal position,
// i.e. the center among its children in the reference rank. If the optimal position turns out to be on the right of the current node position,
// and there's room to move it towards the optimal position, then we adjust the node position.
// After the entire adjustment rank is processed, it becomes the new reference rank and we move on to adjust the rank above, and so on.
// Likewise for all ranks below the initial reference rank, except that we're aligning chilren to fixed parents in this downward direction.
function alignCoords(
  referenceGroupIndex: number,
  rankList: RankGroup[],
  layoutGraph: Dagre.graphlib.Graph,
  ancestorMap: StringMap<Set<string>>
): void {
  for (let i = referenceGroupIndex - 1; i >= 0; i--) {
    alignCoordsByReferenceRank(rankList[i], rankList[i + 1], layoutGraph, ancestorMap);
  }

  for (let j = referenceGroupIndex + 1; j < rankList.length; j++) {
    alignCoordsByReferenceRank(rankList[j], rankList[j - 1], layoutGraph, ancestorMap);
  }
}

function alignCoordsByReferenceRank(
  adjustmentGroup: RankGroup,
  referenceGroup: RankGroup,
  layoutGraph: Dagre.graphlib.Graph,
  ancestorMap: StringMap<Set<string>>
): void {
  const isReferenceRankParentOfAdjustmentRank = referenceGroup.rank - adjustmentGroup.rank < 0;
  const reversedAdjustmentNodeIds = [...adjustmentGroup.nodeIds].reverse();
  const referenceNodeIds = referenceGroup.nodeIds;
  const isVerticalFlex = layoutGraph.graph().rankdir === 'TB';
  const { nodesep: nodeSeperation } = layoutGraph.graph();
  const bottomReferenceNode = layoutGraph.node(referenceNodeIds[referenceNodeIds.length - 1]);
  let lowerBound: number = isVerticalFlex
    ? bottomReferenceNode.x + bottomReferenceNode.width / 2
    : bottomReferenceNode.y + bottomReferenceNode.height / 2;

  for (const adjustmentNodeId of reversedAdjustmentNodeIds) {
    const references = [] as number[];

    referenceNodeIds.forEach(refId => {
      const isReferenceForCurrentAdjustmentNode = isReferenceRankParentOfAdjustmentRank
        ? ancestorMap[adjustmentNodeId].has(refId)
        : ancestorMap[refId].has(adjustmentNodeId);

      if (isReferenceForCurrentAdjustmentNode) {
        const refNode = layoutGraph.node(refId);
        references.push(isVerticalFlex ? refNode.x : refNode.y);
      }
    });

    const adjustmentNode = layoutGraph.node(adjustmentNodeId);
    const maximalAlignPoint = lowerBound - (isVerticalFlex ? adjustmentNode.width : adjustmentNode.height) / 2;
    const optimalAlignPoint = references.length > 0 ? getCenterFromSortedNumbers(references) : maximalAlignPoint;

    const targetAlignPoint = Math.min(optimalAlignPoint, maximalAlignPoint);
    const hasRoomToAlign = (isVerticalFlex ? adjustmentNode.x : adjustmentNode.y) < targetAlignPoint;

    if (hasRoomToAlign) {
      if (isVerticalFlex) {
        adjustmentNode.x = targetAlignPoint;
        lowerBound = adjustmentNode.x - adjustmentNode.width / 2 - nodeSeperation;
      } else {
        adjustmentNode.y = targetAlignPoint;
        lowerBound = adjustmentNode.y - adjustmentNode.height / 2 - nodeSeperation;
      }
    } else {
      // NOTE(lin): All the adjustment nodes above the current adjustment node have been tightly packed.
      // If the current adjustment node won't budge, it's impossible for those above to be adjusted. So bail out now.
      break;
    }
  }
}

function getMedianFromSortedNumbers(numbers: number[]): number {
  const length = numbers.length;
  if (length === 0) {
    throw new Error('Could not get median for an empty number array.');
  }

  if (length % 2 !== 0) {
    const mid = Math.floor(length / 2);
    return numbers[mid];
  } else {
    const right = length / 2;
    const left = right - 1;
    return (numbers[left] + numbers[right]) * 0.5;
  }
}

function getCenterFromSortedNumbers(numbers: number[]): number {
  const length = numbers.length;
  if (length === 0) {
    throw new Error('Could not get center for an empty number array.');
  }

  return (numbers[0] + numbers[length - 1]) * 0.5;
}

function groupByRank(rankMap: StringMap<number>, layoutGraph: Dagre.graphlib.Graph): RankGroup[] {
  const rankList = [] as RankGroup[];
  const isVerticalFlex = layoutGraph.graph().rankdir === 'TB';
  const { nodesep: nodeSeperation } = layoutGraph.graph();

  for (const nodeId of Object.keys(rankMap)) {
    const rank = rankMap[nodeId];

    if (!rankList[rank]) {
      rankList[rank] = {
        rank,
        nodeIds: [],
        flexSpan: 0,
        alignSpan: 0,
      };
    }

    rankList[rank].nodeIds.push(nodeId);

    const node = layoutGraph.node(nodeId);

    const flexSpan = isVerticalFlex ? node.height : node.width;
    if (flexSpan > rankList[rank].flexSpan) {
      rankList[rank].flexSpan = flexSpan;
    }

    const gap = rankList[rank].nodeIds.length === 1 ? 0 : nodeSeperation;
    const alignSpanIncrement = (isVerticalFlex ? node.width : node.height) + gap;
    rankList[rank].alignSpan += alignSpanIncrement;
  }

  // NOTE(lin): Ranks may not be continuous. For example, consider the following graph:
  // A -> B
  // A -> C
  // B -> C
  // C -> B
  // 'A' would be of rank 0, and both 'B' and 'C' would be of rank 2.
  // And the rankList would be
  // [
  //     [nodes_of_rank_zero], undefined, [nodes_of_rank_two]
  // ].
  return rankList.filter(group => !!group);
}

function computeAncestorMap(
  rankList: RankGroup[],
  rankMap: StringMap<number>,
  layoutGraph: Dagre.graphlib.Graph
): StringMap<Set<string>> {
  const ancestorMap: StringMap<Set<string>> = {};

  rankList.forEach(group => {
    group.nodeIds.forEach(nodeId => {
      const parents: string[] = layoutGraph.predecessors(nodeId) as any;

      // NOTE(lin): Filter out parents looping from itself and "lower" hierarchies.
      const precedingParents = parents.filter(parent => rankMap[parent] < rankMap[nodeId]);

      const ancestors = new Set<string>();
      precedingParents.forEach(parent => {
        ancestors.add(parent);

        // NOTE(lin): Since the rankList is ordered by ancestry, the grand-parents must have already been computed.
        const grandParents = ancestorMap[parent];

        grandParents.forEach(grandParent => ancestors.add(grandParent));
      });

      ancestorMap[nodeId] = ancestors;
    });
  });

  return ancestorMap;
}
