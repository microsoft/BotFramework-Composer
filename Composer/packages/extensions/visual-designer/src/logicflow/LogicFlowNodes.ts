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
  constructor(id: string, data: any) {
    super(FlowTypes.Element, id, data);
  }
}

export class FlowGroup extends FlowBaseNode {
  label: string;
  flow: FlowBaseNode[];
  constructor(id: string, data: any, label: string, branchSteps: FlowBaseNode[]) {
    super(FlowTypes.Branch, id, data);
    this.label = label;
    this.flow = branchSteps || [];
  }
}

export class DecisionNode extends FlowBaseNode {
  data: any;
  branches: FlowGroup[] = [];

  constructor(id: string, data: any, branches: FlowGroup[]) {
    super(FlowTypes.Decision, id, data);
    this.branches = branches;
  }
}

export class LoopNode extends FlowBaseNode {
  data: any;
  flow: FlowBaseNode[];

  constructor(id: string, data: any, loopSteps: FlowBaseNode[]) {
    super(FlowTypes.Loop, id, data);
    this.flow = loopSteps || [];
  }
}
