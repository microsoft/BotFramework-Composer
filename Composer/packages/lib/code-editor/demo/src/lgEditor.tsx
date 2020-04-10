// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';

import { LgEditor } from '../../src';

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

# bfdactivity_116673
-Successfully added a todo named @{dialog.todo}

# bfdactivity_832307
-Successfully cleared items in the Todo List.

# bfdactivity_983761
-You don't have any items in the Todo List.

# bfdactivity_725469
-Successfully removed a todo named @{dialog.todo}

# bfdactivity_549615
-@{dialog.todo} is not in the Todo List

# bfdactivity_339580
-You have no todos.

# bfdactivity_662084
-@{ShowTodo}

# bfdactivity_696707
-@{help}

# bfdactivity_157674
- Hi! I'm a ToDo bot. Say "add a todo named first" to get started.
`;

export default function App() {
  const [value, setValue] = useState(content);

  const onChange = value => {
    setValue(value);
  };

  const props = {
    value,
    onChange,
    languageServer: 'localhost:5000/lg-language-server',
  };
  return <LgEditor {...props} />;
}
