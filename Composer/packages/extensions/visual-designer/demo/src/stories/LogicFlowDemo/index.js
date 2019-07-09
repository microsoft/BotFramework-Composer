import React, { useState } from 'react';

import { LogicFlow } from '../../../../src/logicflow/LogicFlow';
import { parseAdaptiveDialog } from '../../../../src/logicflow-obi/parseObi';
import { renderObiData, measureObiData, renderObiStepInsertionPoint } from '../../../../src/logicflow-obi';
import AddToDo from '../../samples/todo/AddToDo.json';
import ObiFlow from '../../samples/logicflow/ObiFlow.json';
import SimpleFlow from '../../samples/logicflow/SimpleFlow.json';
import { Boundary } from '../../../../src/shared/Boundary';

const flows = [
  { name: 'ObiFlow', data: ObiFlow },
  { name: 'AddToDo', data: parseAdaptiveDialog(AddToDo) },
  { name: 'SimpleFlow', data: SimpleFlow },
];
const renderers = [
  {
    name: 'ObiRenderer',
    renderer: {
      measureData: measureObiData,
      renderData: renderObiData,
      renderStepInsertionPoint: renderObiStepInsertionPoint,
    },
  },
  {
    name: 'JsonBoxRenderer',
    renderer: {
      measureData: () => new Boundary(200, 100),
      renderData: function JsonBox(...args) {
        return (
          <div style={{ width: 200, height: 100, border: '1px solid #999', overflow: 'hidden' }}>
            {JSON.stringify(args)}
          </div>
        );
      },
      renderStepInsertionPoint: undefined,
    },
  },
  {
    name: 'TextBoxRenderer',
    renderer: {
      measureData: () => new Boundary(100, 50),
      renderData: function TextBox(id, type, data) {
        return (
          <div
            style={{
              width: 100,
              height: 50,
              border: '1px solid lightblue',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {typeof data === 'string' ? data : '<JSON>'}
          </div>
        );
      },
    },
  },
];

export const LogicFlowDemo = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedRenderer, setSelectedRenderer] = useState(1);
  return (
    <div>
      <div className="flowdata-selector">
        Data:
        <select value={selectedIndex} onChange={e => setSelectedIndex(e.target.value)}>
          {flows.map((x, index) => (
            <option key={x.name} value={index}>
              {x.name}
            </option>
          ))}
        </select>
        Renderer:
        <select value={selectedRenderer} onChange={e => setSelectedRenderer(e.target.value)}>
          {renderers.map((x, index) => (
            <option key={x.name} value={index}>
              {x.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flowdata-visualizer" style={{ margin: 10 }}>
        <LogicFlow
          key={`data:${selectedIndex};renderer:${selectedRenderer}`}
          flow={flows[selectedIndex].data}
          {...renderers[selectedRenderer].renderer}
        />
      </div>
    </div>
  );
};
