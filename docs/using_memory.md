# Using Memory

All bots built with Bot Framework Composer have a "memory" - a representation of everything that is currently in the bot's active mind.
Developers can store and retrieve values in the bot memory, and can use those values to create loops, branches, dynamic messages and behaviors in the bot.
Properties from memory can be used inside templates, and can also be used as part of a calculation.

## Anatomy of a Property in Memory

A piece of data in memory is referred to as a **property** - this is a distinct value identified by a specific address.  The address is made up of two parts - the first part is the **scope** of the property, and the second is the **name** of the property.

Here are a couple of examples:

* `user.name`
* `turn.activity`
* `dialog.index`

The scope of the property determines when the property is available, and how long the value will be retained:

The **user scope** is associated with a specific user. Properties in the user scope are retained forever.

The **conversation scope** is associated with the conversation id. Properties in the user scope are retained forever - and may be accessed by multiple users within the same conversation.

The **dialog scope** is associated with the current dialog and any child or parent dialogs. Properties in the dialog scope are retained until the last active dialog ends.

The **turn scope** is associated with a single turn. Properties in the turn scope are discarded at the end of the turn.


## Memory Actions

## Memory in Conditions

## Memory in LG


## Further Reading

* [Bot Framework Adaptive Dialogs Memory Model](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/adaptive-dialog/docs/memory-model-overview.md)

* [Bot Framework on Github](https://github.com/microsoft/botframework)



## Next

* [Overview of Bot Framework Composer](overview_of_bfd.md) 