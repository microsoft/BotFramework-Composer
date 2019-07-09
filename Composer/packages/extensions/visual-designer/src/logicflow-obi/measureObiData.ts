import { measureJsonBoundary } from '../layouters/measureJsonBoundary';
import { FlowTypes } from '../logicflow/models/LogicFlowNodes';
import { ObiTypes } from '../shared/ObiTypes';

export const measureObiData = (id: string, type: FlowTypes, data: any) => {
  switch (type) {
    case FlowTypes.Flow:
      return measureJsonBoundary({ $type: ObiTypes.StepGroup, children: data });
    case FlowTypes.Element:
      if (data && data.$type) {
        switch (data.$type) {
          case ObiTypes.Foreach:
            return measureJsonBoundary({ ...data, $type: ObiTypes.ForeachDetail });
          case ObiTypes.ForeachPage:
            return measureJsonBoundary({ ...data, $type: ObiTypes.ForeachPageDetail });
          case ObiTypes.IfCondition:
          case ObiTypes.SwitchCondition:
            return measureJsonBoundary({ ...data, $type: ObiTypes.ConditionNode });
        }
      }
    default:
      return measureJsonBoundary(data);
  }
};
