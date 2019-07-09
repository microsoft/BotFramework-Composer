import { Boundary } from '../../shared/Boundary';

export enum FlowTypes {
  Flow = 'Flow',
  Element = 'Element',
  Decision = 'Decision',
  Loop = 'Loop',
}

export class FlowBaseNode {
  '@': FlowTypes = FlowTypes.Element;

  id: string = '';
  data: any = {};

  boundary = new Boundary();

  constructor(id: string, data: any) {
    this.id = id;
    this.data = data;
  }
}

export class FlowGroup extends FlowBaseNode {
  '@' = FlowTypes.Flow;

  label: string;
  steps: FlowBaseNode[];

  constructor(id: string, data: any, label: string, steps: FlowBaseNode[]) {
    super(id, data);
    this.label = label;
    this.steps = steps || [];
  }
}

export class DecisionNode extends FlowBaseNode {
  '@' = FlowTypes.Decision;

  branches: FlowGroup[] = [];

  constructor(id: string, data: any, branches: FlowGroup[]) {
    super(id, data);
    this.branches = branches;
  }
}

export class LoopNode extends FlowBaseNode {
  '@' = FlowTypes.Loop;

  flow: FlowGroup;

  constructor(id: string, data: any, loopSteps: FlowGroup) {
    super(id, data);
    this.flow = loopSteps;
  }
}
