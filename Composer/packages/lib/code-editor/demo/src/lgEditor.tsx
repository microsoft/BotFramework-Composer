// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';

import { LgCodeEditor } from '../../src';

import { mockTelemetryClient } from './mockTelemetryClient';

const content = `# Hello
-@{Welcome(time)} @{name}

# Welcome(time)
-IF:@{time == 'morning'}
  - Good morning
-ELSEIF:@{time == 'evening'}
  - Good evening
-ELSE:
  - How are you doing,

# Exit
-Thanks for using todo bot.

# Greeting
-What's up bro

# ShowTodo
-IF:@{count(user.todos) > 0}
-\`\`\`
{HelperFunction()}
@{join(foreach(user.todos, x, showSingleTodo(x)), '\n')}
\`\`\`
-ELSE:
-You don't have any todos.

# showSingleTodo(x)
-* {x}

# HelperFunction
- IF: @{count(user.todos) == 1}
  - Your most recent @{count(user.todos)} task is
- ELSE:
  - Your most recent @{count(user.todos)} tasks are

# help
-I can add a todo, show todos, remove a todo, and clear all todos
-I can help you yes I can
-Help, we don't need no stinkin' help!

# SendActivity_116673
-Successfully added a todo named @{dialog.todo}

# SendActivity_832307
-Successfully cleared items in the Todo List.

# SendActivity_983761
-You don't have any items in the Todo List.

# SendActivity_725469
-Successfully removed a todo named @{dialog.todo}

# SendActivity_549615
-@{dialog.todo} is not in the Todo List

# SendActivity_339580
-You have no todos.

# SendActivity_662084
-@{ShowTodo}

# SendActivity_696707
-@{help}

# SendActivity_157674
- Hi! I'm a ToDo bot. Say "add a todo named first" to get started.
`;

export default function App() {
  const [value, setValue] = useState(content);

  const onChange = (value) => {
    setValue(value);
  };

  const props = {
    value,
    onChange,
    languageServer: 'localhost:5000/lg-language-server',
  };
  return <LgCodeEditor {...props} telemetryClient={mockTelemetryClient} />;
}
