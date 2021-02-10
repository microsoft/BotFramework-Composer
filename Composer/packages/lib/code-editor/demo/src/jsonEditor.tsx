// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';

import { JsonEditor } from '../../src';

const content = {
  'ComposerDialogs/AddToDo/AddToDo.lu': {
    lastUpdateTime: 1,
    lastPublishTime: 0,
  },
  'ComposerDialogs/ClearToDos/ClearToDos.lu': {
    lastUpdateTime: 1,
    lastPublishTime: 0,
  },
  'ComposerDialogs/DeleteToDo/DeleteToDo.lu': {
    lastUpdateTime: 1,
    lastPublishTime: 0,
  },
  'ComposerDialogs/Main/Main.lu': {
    lastUpdateTime: 1573624458300,
    lastPublishTime: 0,
  },
  'ComposerDialogs/ShowToDos/ShowToDos.lu': {
    lastUpdateTime: 1,
    lastPublishTime: 0,
  },
};

export default function App() {
  const [value, setValue] = useState(content);

  const onChange = (value) => {
    setValue(value);
  };

  const props = {
    value,
    onChange,
  };
  return <JsonEditor {...props} />;
}
