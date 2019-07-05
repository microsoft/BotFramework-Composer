import React from 'react';

import { LogicFlow } from '../../../src/logicflow';
import SimpleFlow from '../samples/logicflow/SimpleFlow.json';
import AddToDo from '../samples/todo/AddToDo.json';
import { parseAdaptiveDialog } from '../../../src/logicflow/parseObi';

export const LogicFlowDemo = () => {
  const flow = parseAdaptiveDialog(AddToDo);
  return (
    <div>
      <LogicFlow flow={SimpleFlow} />
    </div>
  );
};
