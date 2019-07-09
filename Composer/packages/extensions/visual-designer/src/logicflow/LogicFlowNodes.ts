import { Boundary } from '../shared/Boundary';

export enum FlowTypes {
  Flow = 'Flow',
  Element = 'Element',
  Decision = 'Decision',
  Branch = 'Branch',
  Loop = 'Loop',
}

export class FlowBaseNode {
  '@': FlowTypes;
  id: string = '';

  data: any = {};

  constructor(type: FlowTypes, id: string, data: any) {
    this['@'] = type;
    this.id = id;
    this.data = data;
  }
}

export class ElementNode extends FlowBaseNode {
  boundary: Boundary;
  element?: JSX.Element;
  constructor(id: string, data: any, boundary: Boundary, element?: JSX.Element) {
    super(FlowTypes.Element, id, data);
    this.boundary = boundary;
    this.element = element;
  }
}

export class FlowGroup extends FlowBaseNode {
  label: string;
  flow: FlowBaseNode[];
  constructor(id: string, data: any, label: string, flowSteps: FlowBaseNode[]) {
    super(FlowTypes.Branch, id, data);
    this.label = label;
    this.flow = flowSteps || [];
  }
}

export class DecisionNode extends FlowBaseNode {
  condition: ElementNode;
  branches: FlowGroup[] = [];

  constructor(id: string, data: any, condition: ElementNode, branches: FlowGroup[]) {
    super(FlowTypes.Decision, id, data);
    this.condition = condition;
    this.branches = branches;
  }
}

export class LoopNode extends FlowBaseNode {
  flow: FlowBaseNode[];

  constructor(id: string, data: any, loopSteps: FlowBaseNode[]) {
    super(FlowTypes.Loop, id, data);
    this.flow = loopSteps || [];
  }
}
