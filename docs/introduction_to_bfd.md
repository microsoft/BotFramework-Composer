# Introduction to Bot Framework Designer
### How can I use Bot Framework Designer to build cutting edge conversational software?

Bot Framework Designer is an integrated development environment (IDE) for building bots and other types of conversational software with the Microsoft Bot Framework technology stack. Inside this web-based tool, you'll find everything you need to build a modern, state-of-the-art conversational experience:

* A visual dialog designer
* Tools to train and manage a language understanding (NLU) component
* A powerful language generation and templating system
* A ready-to-use bot runtime executable

Bot Framework Designer enables teams working to create bots to build all kinds of conversational experiences that use the latest features from the Bot Framework SDK **without writing code**. The Designer app reads and writes from the Adaptive Dialog format, a JSON specification shared by many tools provided by the Bot Framework. Dialogs, NLU training data and message templates are treated like normal developer assets - files that can be committed to source control and deployed alongside code updates.

## Building Blocks

Modern conversational software is comprised of a many components, including programming code, custom business logic, cloud APIs, training data for language processing systems and perhaps most importantly, the actual content and copy used in conversations with the bot's end users.  

With Bot Framework Designer, all of these pieces are integrated with one another into a single interface for constructing blocks of bot functionality called "**Dialogs**." 

Each dialog represents a piece of the bot's functionality. They contain instructions for how the bot will react to input. Simple bots will have a few dialogs. Complex bots may have dozens or hundreds of individual dialogs.

Dialogs contain a series of **actions** that the bot will undertake to fulfill a user's request. Actions are things like sending messages, making calculations, and performing computational tasks on behalf of the user. The path the bot follows through a dialog can branch and loop. The bot can ask questions, validate input, manipulate and store values in memory, and make decisions.

Dialogs also contain **events** - rules that tell the bot how to process incoming messages. The most common use of event handlers is to launch a dialog in response to a request. However, they are also used to define a wide variety of bot behaviors such as providing context-specific help, and responding to a requests to quit or cancel, or handling custom, developer-defined events originating from the app itself.

With a single click from within Designer, developers can launch the **bot runtime**, and connect to their bot in the Bot Framework Emulator. Once tested in the emulator, the bot runtime can be connected to the Bot Framework Channel service, and from their... the world!

## The Natural Place for Natural Language

Creating a natural language understanding system can be tricky business, especially when developers are required to manage the NLU in a completely different environment than the rest of their bot.  Bot Framework Designer brings language understanding right into the editor, allowing developers to train an NLU system in the context.

As dialog are built in the main editor, developers can continuously add to their bot's natural language capabilities through a simple markdown-like format that makes it easy to define new intents and provide sample utterances. Bot Framework Designer detects changes and updates the bot's cloud-based NLU model automatically so it is always up to date.

## Bots with character

Creating grammatically correct, data driven responses that also use a consistent tone and convey a clear brand voice has always been a challenge for bot developers! Bot Framework Designer's integrated language generation system allows developers - and the writers who work with them - to create replies with a great deal of flexibility.

With LG, previously complex tasks can be quickly achieved:

* include dynamic tokens in messages
* generate grammatically correct lists, pronouns, articles
* provide context-sensitive variation in messages
* create dynamic card attachments

## Unified Toolset

Under the hood, Bot Framework Designer harnesses the power of many components from the Bot Framework. When building in Designer, developers will have access to:

* Adaptive Dialogs and the Bot Framework SDK
* Natural Language Understanding service from LUIS.ai
* Bot Framework Emulator

After using Bot Framework Designer, the resulting bot project will contain reusable assets in the form of JSON and Markdown files that can be bundled and packaged with a bot's source code. These files can be used with a wide variety of compatible tools from the Bot Framework library.

## Next

* [Overview of Bot Framework Designer](overview_of_bfd.md) 

## Further Reading

* [Bot Framework on Github](https://github.com/microsoft/botframework)
