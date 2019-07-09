import { Boundary } from '../shared/Boundary';

export enum FlowTypes {
  Flow = 'Flow',
  Element = 'Element',
  Decision = 'Decision',
  Branch = 'Branch',
  Loop = 'Loop',
}

export class BoundedJSXElement {
  el: JSX.Element;
  boundary: Boundary;
  constructor(element: JSX.Element, boundary: Boundary) {
    this.el = element;
    this.boundary = boundary;
  }
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
  element: BoundedJSXElement;
  constructor(id: string, data: any, element: BoundedJSXElement) {
    super(FlowTypes.Element, id, data);
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
