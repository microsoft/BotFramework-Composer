import React, { useState } from 'react';

import { LogicFlow } from '../../../src/logicflow';
import { FlowTypes } from '../../../src/logicflow/LogicFlowNodes';
import { parseAdaptiveDialog } from '../../../src/logicflow/parseObi';
import AddToDo from '../samples/todo/AddToDo.json';
import SimpleFlow from '../samples/logicflow/SimpleFlow.json';
import { measureJsonBoundary } from '../../../src/layouters/measureJsonBoundary';
import { ObiTypes } from '../../../src/shared/ObiTypes';
import { DefaultRenderer } from '../../../src/components/nodes/DefaultRenderer';

const flows = [{ name: 'SimpleFlow', data: SimpleFlow }, { name: 'AddToDo', data: parseAdaptiveDialog(AddToDo) }];

const measureData = (id, type, data) => {
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

const renderData = (id, type, data) => {
  return <DefaultRenderer id={id} data={data} onEvent={(e, id) => console.log('Event fired: ', e, id)} />;
};

export const LogicFlowDemo = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  return (
    <div>
      <div className="flowdata-selector">
        <select value={selectedIndex} onChange={e => setSelectedIndex(e.target.value)}>
          {flows.map((x, index) => (
            <option key={x.name} value={index}>
              {x.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flowdata-visualizer" style={{ margin: 10 }}>
        <LogicFlow flow={flows[selectedIndex].data} measureData={measureData} renderData={renderData} />
      </div>
    </div>
  );
};
