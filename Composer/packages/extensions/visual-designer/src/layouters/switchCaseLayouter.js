import { Boundary } from '../components/shared/Boundary';
import { ElementInterval } from '../shared/elementSizes';

const SwitchToBaseline = 10;
const CaseToBaseline = 30;
const CaseToBottom = 20;
const CaseBlockIntervalX = ElementInterval.y;
const MisalignmentThreshold = 30;

/**
 *        [switch]
 *           |
 *      ------------
 *      |   |  |   |
 */
export function switchCaseLayouter(switchNode, caseNodes = []) {
  if (!Array.isArray(caseNodes) || caseNodes.length === 0) {
    return { boundary: switchNode.boundary, nodeMap: { switchNode, caseNodes: [] }, edges: [] };
  }

  /** Calculate boundary */
  const containerHeight =
    switchNode.boundary.height +
    SwitchToBaseline +
    CaseToBaseline +
    Math.max(0, ...caseNodes.map(x => x.boundary.height)) +
    CaseToBottom;
  const containerWidth = Math.max(
    switchNode.boundary.width,
    caseNodes.reduce((accWidth, caseNode) => accWidth + caseNode.boundary.width + CaseBlockIntervalX, 0)
  );
  const containerBoundary = new Boundary(containerWidth, containerHeight);

  /** Calulate nodes position */
  // switch node
  switchNode.offset = {
    x: (containerWidth - switchNode.boundary.width) / 2,
    y: 0,
  };

  // case nodes
  const CaseNodeBeginY = switchNode.boundary.height + switchNode.offset.y + SwitchToBaseline + CaseToBaseline;
  caseNodes.reduce((accOffsetX, x) => {
    x.offset = {
      x: accOffsetX,
      y: CaseNodeBeginY,
    };
    return accOffsetX + CaseBlockIntervalX + x.boundary.width;
  }, 0);

  /**
   * Handle misalignment cases
   *
   *      [switch]
   *          |
   *         --
   *         |
   *        [case]
   *         --
   *          |
   * When caseNode[caseNode.length / 2] happened to be possibly aligned with switch node's axis X, align them.
   * The threshold should be smaller than switchNode.width / 2, otherwise it will change the container's width.
   */
  const middleCase = caseNodes[Math.floor(caseNodes.length / 2)];
  const xAxisDelta =
    middleCase.offset.x + middleCase.boundary.axisX - (switchNode.offset.x + switchNode.boundary.axisX);
  if (Math.abs(xAxisDelta) < MisalignmentThreshold) {
    containerBoundary.axisX += xAxisDelta;
    switchNode.offset.x += xAxisDelta;
  }

  /** Calculate edges */
  const edges = [];
  edges.push({
    id: `edge/${switchNode.id}/switch/switch->baseline`,
    direction: 'y',
    x: switchNode.offset.x + switchNode.boundary.axisX,
    y: switchNode.offset.y + switchNode.boundary.height,
    length: SwitchToBaseline,
  });

  const BaselinePositionY = switchNode.offset.y + switchNode.boundary.height + SwitchToBaseline;
  const firstCase = caseNodes[0];
  const lastCase = caseNodes[caseNodes.length - 1];

  const coordXs = [switchNode, firstCase, lastCase].map(x => x.offset.x + x.boundary.axisX);
  if (coordXs[0] > coordXs[1] && coordXs[2] > coordXs[0]) {
    /**
     *        |
     *    -----------
     *    |     |    |
     */
    edges.push({
      id: `edge/${switchNode.id}/case/baseline`,
      direction: 'x',
      x: firstCase.offset.x + firstCase.boundary.axisX,
      y: BaselinePositionY,
      length: lastCase.offset.x + lastCase.boundary.axisX - (firstCase.offset.x + firstCase.boundary.axisX),
    });

    edges.push({
      id: `edge/${switchNode.id}/case/bottomline`,
      direction: 'x',
      x: firstCase.offset.x + firstCase.boundary.axisX,
      y: containerBoundary.height,
      length: lastCase.offset.x + lastCase.boundary.axisX - (firstCase.offset.x + firstCase.boundary.axisX),
    });
  } else {
    /**
     *         |                |                                     |
     *   -------     or         -------------         or            ---
     *   | |                          |      |                      |
     */
    const coordXs = [switchNode, firstCase, lastCase].map(x => x.offset.x + x.boundary.axisX);
    const fromX = Math.min(...coordXs);
    const toX = Math.max(...coordXs);
    edges.push({
      id: `edge/${switchNode.id}/case/baseline`,
      direction: 'x',
      x: fromX,
      y: BaselinePositionY,
      length: toX - fromX,
    });

    edges.push({
      id: `edge/${switchNode.id}/case/bottomline`,
      direction: 'x',
      x: fromX,
      y: containerBoundary.height,
      length: toX - fromX,
    });
  }

  caseNodes.forEach(x => {
    edges.push(
      {
        id: `edge/${switchNode.id}/case/baseline->${x.id}`,
        direction: 'y',
        x: x.offset.x + x.boundary.axisX,
        y: BaselinePositionY,
        length: CaseToBaseline,
        text: x.data.label,
      },
      {
        id: `edge/${switchNode.id}/case/${x.id}->bottom`,
        direction: 'y',
        x: x.offset.x + x.boundary.axisX,
        y: x.offset.y + x.boundary.height,
        length: containerBoundary.height - x.offset.y - x.boundary.height,
      }
    );
  });

  return { boundary: containerBoundary, nodeMap: { switchNode, caseNodes }, edges };
}
