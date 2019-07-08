import React from 'react';

import { LogicFlow } from '../../../src/logicflow';
import { parseAdaptiveDialog } from '../../../src/logicflow/parseObi';
import AddToDo from '../samples/todo/AddToDo.json';

export const LogicFlowDemo = () => {
  const flow = parseAdaptiveDialog(AddToDo);
  return (
    <div>
      <LogicFlow flow={flow} />
    </div>
  );
};
