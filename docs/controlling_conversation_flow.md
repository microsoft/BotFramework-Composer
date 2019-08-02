# Controlling conversation flow

The conversations a bot has with its users are controlled by the content of its dialog system. Dialogs contain templates for messages the bot will send, along with instructions for the bot to carry out computational tasks. While some dialogs are linear - just one message after the other - more complex interactions will require dialogs that branch and loop based on what the user says and the choices they make.

Composer offers several mechanisms for controlling the flow of the conversation. These building blocks instruct the bot to make a decision based on a [property in memory]() or an [expression]() and choose the right path based on that decision:

![flow menu](./Assets/flow-actions-menu.png "screenshot of the flow menu")

* The `If/Else` action instructs the bot choose between one of two paths  based on a yes/or or true/false type value.

* The `Switch` action instructs the bot to choose the path associated with a specific value - for example, a switch can be used to build a multiple-choice menu.

* The `For Each` action instructs the bot to loop through a set of values stored in an array and carry out the same set of actions with each one. For very large lists, there is also a `For Each Page` action that can be used to step through the list one page at a time.

# Branching with IF/ELSE

![if/else block](./Assets/ifelse-properties.png "screenshot of the if else properties")

The `If/Else` action creates a decision point for the bot, after which it will follow one of two possible branches. The decision is controlled by the `Condition` field, which should contain an [expression]() which evaluates to true or false.

In the screenshot above, the condition would evaluate to true if there are any items set in a property called `conversation.cart.items`. If the list is empty, the condition would evaluate to false.

There are many ways to define a condition like this:

* test a number: `user.age > 0`
* test if a property is set: `user.name !== null`
* match a specific value `user.notify == true`

Once the condition has been set, the corresponding branches can be built. The editor will now display two parallel paths in the flow - one that will be used if the condition evalutes to `true`, and one if the condition evaluates `false`.

![add items to a branch](./Assets/if-branch.gif "if branch being constructed")

&rarr; Read more about [using properties in memory when defining conditions for branching actions](using_memory.md#memory-in-branching-actions)

# Branching with SWITCH

![switch block](./Assets/switch-properties.png "screenshot of the switch properties")

In a `Switch` result, the value of the `Condition` field is used to choose between any number of pre-set paths. Each path is tied to one possible value of the condition.

Consider the screenshot above: the condition is set to evaluate `dialog.choice` and choose a path based on its value. 

Each path is created by clicking the "Add New Case" button and entering matching value. As each case is added, a new branch will appear in the flow which can then be customized with actions. In addition to any cases created, there will always be a "default" branch which will be used if none of the other cases match.

See the screenshot below, which contains the "default" branch, as well 2 additional branches - one for choice "a" and one for choice "b":

![switch condition](./Assets/switch-condition.png "screenshot of the switch condition in the dialog flow")

# Looping with For Each

![foreach properties](./Assets/foreach-properties.png)

When looping over a list of items with a for each action, three properties come into play:

The first is the `list property`: this is a property in memory that contains an array of elements.

The second is the `value property`: inside the loop, this property will be used to hold the currently active item.

Finally, `index property`: inside the loop, this property will contain the numeric index of the item inside the array.

&rarr; Read more about [using properties in memory when defining for each actions](using_memory.md#memory-in-loops)

Once the loop begins, it will repeat once for each item in the list of items. In the graph, the looping actions are grouped inside a dotted line, as seen below:

![foreach loop](./Assets/foreach-loop.png)

Note: It is not currently possible to end the loop before all items have been processed. If the bot needs to process only a subset of the items, use `If/Else` and `Switch` actions within the loop to create further conditional paths.

# Dialogs: start/end/repeat/cancel 

# Child Dialogs

# Conditional versions of a message in LG
