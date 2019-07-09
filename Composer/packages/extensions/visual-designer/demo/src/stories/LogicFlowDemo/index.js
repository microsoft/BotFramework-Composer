import React, { useState } from 'react';

import { LogicFlow } from '../../../../src/logicflow/LogicFlow';
import { parseAdaptiveDialog } from '../../../../src/logicflow/parseObi';
import { renderObiData, measureObiData, renderObiStepInsertionPoint } from '../../../../src/logicflow-obi';
import AddToDo from '../../samples/todo/AddToDo.json';
import SimpleFlow from '../../samples/logicflow/SimpleFlow.json';

const flows = [{ name: 'SimpleFlow', data: SimpleFlow }, { name: 'AddToDo', data: parseAdaptiveDialog(AddToDo) }];

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
        <LogicFlow
          flow={flows[selectedIndex].data}
          measureData={measureObiData}
          renderData={renderObiData}
          renderStepInsertionPoint={renderObiStepInsertionPoint}
        />
      </div>
    </div>
  );
};
