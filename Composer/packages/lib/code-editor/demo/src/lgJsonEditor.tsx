// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, Fragment } from 'react';

import { LgCodeEditor } from '../../src';
import { JsonEditor } from '../../src';

import { mockTelemetryClient } from './mockTelemetryClient';

const jsonContent = {
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

const lgContent = `# Hello
-[Welcome(time)] {name}

# Welcome(time)
-IF:{time == 'morning'}
  - Good morning
-ELSEIF:{time == 'evening'}
  - Good evening
-ELSE:
  - How are you doing,

# Exit
-Thanks for using todo bot.

# Greeting
-What's up bro

# ShowTodo
-IF:{count(user.todos) > 0}
-\`\`\`
{HelperFunction()}
@{join(foreach(user.todos, x, showSingleTodo(x)), '\n')}
\`\`\`
-ELSE:
-You don't have any todos.

# showSingleTodo(x)
-* {x}

# HelperFunction
- IF: {count(user.todos) == 1}
  - Your most recent @{count(user.todos)} task is
- ELSE:
  - Your most recent @{count(user.todos)} tasks are

# help
-I can add a todo, show todos, remove a todo, and clear all todos
-I can help you yes I can
-Help, we don't need no stinkin' help!

# SendActivity_116673
-Successfully added a todo named {dialog.todo}

# SendActivity_832307
-Successfully cleared items in the Todo List.

# SendActivity_983761
-You don't have any items in the Todo List.

# SendActivity_725469
-Successfully removed a todo named {dialog.todo}

# SendActivity_549615
-{dialog.todo} is not in the Todo List

# SendActivity_339580
-You have no todos.

# SendActivity_662084
-[ShowTodo]

# SendActivity_696707
-[help]

# SendActivity_157674
- Hi! I'm a ToDo bot. Say "add a todo named first" to get started.
`;

export default function App() {
  const [value1, setValue1] = useState(lgContent);
  const [value2, setValue2] = useState(jsonContent);

  const props1 = {
    value: value1,
    onChange: (value) => {
      setValue1(value);
    },
    languageServer: 'localhost:5000/lg-language-server',
  };

  const props2 = {
    value: value2,
    onChange: (value) => {
      setValue2(value);
    },
  };
  return (
    <Fragment>
      <LgCodeEditor {...props1} telemetryClient={mockTelemetryClient} />
      <JsonEditor {...props2} />
    </Fragment>
  );
}
