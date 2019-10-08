# Memory in Bot Framework Composer

All bots built with Bot Framework Composer have a "memory" - a representation of everything that is currently in the bot's active mind. Developers can store and retrieve values in the bot memory, and can use those values to create loops, branches, dynamic messages and behaviors in the bot.
Properties from memory can be used inside templates, and can also be used as part of a calculation.

The memory system makes it possible for bots built in Composer to do things like:

* Store a user profile and user preferences
* Remember things between sessions - like the last search query or a list of recently mentioned locations
* Pass information between dialogs

## Anatomy of a property in memory

A piece of data in memory is referred to as a **property**. A property is a distinct value identified by a specific address comprised of two parts -  the **scope** of the property and the **name** of the property.

Here are a couple of examples:
* `user.name`
* `turn.activity`
* `dialog.index`
* `user.profile.age`

The scope of the property determines when the property is available, and how long the value will be retained.

### Storing information about users and ongoing converations
The bot's memory has two "permanent" scopes - a place to store information about individual users, and a place to store information about ongoing conversations:

* **user** is associated with a specific user. Properties in the user scope are retained forever.
* **conversation** is associated with the conversation id. Properties in the user scope are retained forever and may be accessed by multiple users within the same conversation (for example, multiple users together in an MS Teams channel).

### Storing temporary values during task handling
The bot's memory also has two "ephemeral" scopes - a place to store temporary values that are only relevant while a task is being handled:

* **dialog** is associated with the active dialog and any child or parent dialogs. Properties in the dialog scope are retained until the last active dialog ends.
* **turn** is associated with a single turn. You can also think of this as the bot handling a single message from the user. Properties in the turn scope are discarded at the end of the turn.

## Set properties with prompts
Collecting input from a user is done using **prompts**. Prompts define the question to pose to the user with the **Initial Prompt**, as well as a **Property** in memory** where the user's response will be stored. Prompot responses can be formatted before being stored by selecting an option for **Output Format**.

![Prompt definition](./media/memory-concept/memory-text.png)

In the above example of a text prompt, the result of the prompt "Hello, what is your name?" will be automatically stored as the `user.name` property. The result will be stored lowercase since the *lowercase* ouput format was selected.

## Set properties using memory actions

Bot Framework provides a set of memory manipulation actions to create and modify properties in memory. Properties can be created on the fly in the Composer editor - the bot runtime will automatically manage the underlying data for you in the background.

![Memory manipulation menu](./existingdocs/Assets/memory-manipulation-menu.png)

Use **Set a Property** to set the value of a property.

![Delete Property](./media/memory-concept/memory-setproperty.png)

For example, set `user.onboarded` to `true`. The value of a property can be set to a literal value, like `true`, 0, or `fred`, or it can be set to the result of an [computed expression](#expressions). When storing simple values, it is not necessary to initialize the property.

Use **Initialize a Property** to create new properties that are objects or arrays. 

![Initialize Property](./media/memory-concept/memory-initializeproperty.png)

For example, initialize `user.profile` to `{}` or intialze `dialog.toppings` to `[]`. This allows your bot to use sub-properties, or store multiple values inside the property.  
- need to clarify 
It is important to note that before setting the value of a sub-property like `user.profile.age`, the `user.profile` must first be initialized. It is not necessary to further initialize `user.profile.age` unless `age` must also contain sub-values.

Use **Edit an Array Property** to add and remove items from an array. Items can be added or removed from the top or bottom of an array using push, pop and take. Items can also be removed from an array. 

![Edit Array Property](./media/memory-concept/memory-editarrayproperty.png)

Note that it is possible to push the value of an existing property into another Array property - for example: push `turn.choice` onto `dialog.choices`.

Use **Delete a Property** to remove a property from memory.

![Delete Property](./media/memory-concept/memory-deleteproperty.png)

## Set properties with dialogs

Dialogs can return values to their parent dialogs. In this way, a child dialog can encapsulate a multi-step interaction, collect and compute multiple values, and then return a single value to the parent.

For example, a child dialog might first **initialize an object property** called `dialog.profile`.  Then, using prompts, build a compound property representing a user profile.  Finally, the dialog returns the compound value to the parent dialog:

![Sample dialog](./existingdocs/Assets/dialog-with-return.png)

The return value is specified as part of the **End Dialog** action:

![Dialog return value property](./existingdocs/Assets/dialog-return-value.png)

Finally, the parent dialog is configured to capture the return value inside the **begin a dialog** action:

![Return value stored in parent dialog](./existingdocs/Assets/dialog-property.png)

When executed, the bot will perform the `profile` child dialog, collect the user's name and age in a _temporary_ scope, then return it to the parent dialog where it is captured into the `user.profile` property and stored permanently.

## Automatic properties

Some properties are automatically created and managed by the bot. These are available automatically.

|Property |Description
|-- |--
| turn.activity | The full incoming [Activity](https://docs.microsoft.com/en-us/javascript/api/botframework-schema/activity?view=botbuilder-ts-latest) object
| turn.intents | If a recognizer is run, the intents found
| turn.entities | If a recognizer is run, the entities found
| turn.dialogEvents.[event name].value | Payload of a custom event fired using the EmitEvent action.

## Refer to properties in memory

Bots can retrieve and use values from memory for a variety of purposes. The bot may need to use a value in order to construct an outgoing message. The bot may need to make a decision based on a value and perform different actions based on that decision. The bot may need to use the value to calculate other values.

Sometimes, you will refer directly to a property by its address in memory: `user.name`.  Other times, you will refer to one or more properties as part of an expression: `(dialog.orderTotal + dialog.orderTax) > 50`.  When refering to properties in memory, it is generally possibly to use either mechanism to access the necessary values.
- do we know which is preferred/suggested?

### Expressions

Bot Framework uses the [common expression language](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/common-expression-language) to calculate computed values. This syntax allows developers to create composite values, define complex conditional tests, and transform the content and format of values.

*  [Operators](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/common-expression-language#operators)
* [Built-in functions](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/common-expression-language/prebuilt-functions.md#pre-built-functions)

When used in expressions, no special notation is necessary to refer to a property from memory.

### Memory in Branching Actions

A bot can evaluate values from memory when making decisions inside a branching action like an `If/Else` or `Switch` action. The conditional expression that is tested in one of these branching actions is an [expression](#expressions) that, when evaluated, drives the decision.

In the example below, the expression `user.profile.age > 13` will evaluate to either `TRUE` or `FALSE`, and the branch action will then execute the appropriate branch.

![If/Else Condition](./media/memory-concept/memory-ifelse.png)

In this second example, the value of `turn.choice` is used to match against multiple switch cases. Note that, while it looks like a raw reference to a property, this is actually an expression - since no operation is being taken on the property, the expression evaluates to the raw value.

![Switch condition](./existingdocs/Assets/switch-condition.png)

### Memory in loops

When using `For each` and `For each Page` actions, properties also come into play. The definition of a for loop requires three properties: one that holds the list of items to loop over, one that will be used to hold the currently selected item inside the loop, and one to hold the array index of the selected item. The bot manages the value and index properties automatically.

![foreach properties](./existingdocs/Assets/foreach-properties.png)

### Memory in LG

One of the most powerful features of the Bot Framework system is language generation - particularly when used alongside properties pulled from memory.
You can refer to properties in the text of any message - including prompts.
Properties can also be referred to in LG templates and functions - [learn more about the full scope of language generation system in this section.](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/language-generation)

To use the value of a property from memory inside a message, wrap the property reference in curly brackets: `{user.profile.name}`

The screenshot below demonstrates how a bot can prompt a user for a value, then immediately use that value in a confirmation message.

![LG memory](./media/memory-concept/memory-lg.png)


In addition to raw properties values, it is also possible to embed [expressions](#expressions) into the message template.  For example, it is possible to use the built-in `join()` and `foreach()` operators to format a list. 

Given an array property held in `dialog.list`,  the expression `{ join(foreach(dialog.list, item, item), ',', ', and')) }` would result in a  grammatically correct list in the format, "item 1, item 2, and item 3"

Properties from memory can also be used within an LG template to provide conditional variants of a messag and can be passed as parameters to built-in and custom functions.  [Learn more about LG](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/language-generation).

### Memory shorthands

Bot Framework provides a variety of shortcuts for referring to properties in memory.  [See the full list here.](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/adaptive-dialog/docs/memory-model-overview.md#memory-short-hands)


## Further reading

* [Bot Framework Adaptive Dialogs Memory Model](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/adaptive-dialog/docs/memory-model-overview.md)

* [Bot Framework on Github](https://github.com/microsoft/botframework)


## Next

* [link to next concept](next concept link) 