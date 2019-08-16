# Introduction to Bot Framework Composer
### How can I use Bot Framework Composer to build cutting edge conversational software?

Bot Framework Composer is an integrated development environment (IDE) for building bots and other types of conversational software with the Microsoft Bot Framework technology stack. Inside this web-based tool, you'll find everything you need to build a modern, state-of-the-art conversational experience:

* A visual dialog Composer
* Tools to train and manage a language understanding (NLU) component
* A powerful language generation and templating system
* A ready-to-use bot runtime executable

Bot Framework Composer enables teams working to create bots to build all kinds of conversational experiences that use the latest features from the Bot Framework SDK **in a visual manner**. The Composer app reads and writes from the Adaptive Dialog format, a JSON specification shared by many tools provided by the Bot Framework. Dialogs, NLU training data and message templates are treated like normal developer assets - files that can be committed to source control and deployed alongside code updates.

## Building Blocks

Modern conversational software is comprised of many components, including programming code, custom business logic, cloud APIs, training data for language processing systems and perhaps most importantly, the actual content and copy used in conversations with the bot's end users.  

With Bot Framework Composer, all of these pieces are integrated with one another into a single interface for constructing blocks of bot functionality called "**Dialogs**." [(SDK Docs: Bot Framework Dialogs)](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-concept-dialog?view=azure-bot-service-4.0)

Each dialog represents a piece of the bot's functionality. They contain instructions for how the bot will react to input. Simple bots will have a few dialogs. Complex bots may have dozens or hundreds of individual dialogs.

As a dialog is called into action, its **recognizer** will process the message, attempting to extract the primary **intent** represented by the message, along with any **entity values** the message includes. After processing the message, this information is passed onto the dialog's event handlers. Composer currently supports 2 types of recognizers: one powered by the [LUIS.ai service](https://www.luis.ai), and one powered by regular expressions. A dilaog can have no recognizer. 

The functionality of a dialog is contained within **event handlers** - rules that tell the bot how to process incoming messages.  They are also used to define a wide variety of bot behaviors, from performing the main fulfillment of the user's request, to handling [interuptions](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-handle-user-interrupt?view=azure-bot-service-4.0&tabs=csharp) like requests for help, to handling custom, developer-defined events originating from the app itself.

Event handlers contain a series of **actions** that the bot will undertake to fulfill a user's request. Actions are things like sending messages, making calculations, and performing computational tasks on behalf of the user. The path the bot follows through a dialog can branch and loop. The bot can ask questions, validate input, manipulate and store values in memory, and make decisions.

As the bot takes actions and sends messages, the **language generator** is called into play. This allows messages sent by the bot to be composed from variables and templates. Language generators can be used to create reusable components, variable messages, macros, and dynamic messages that are grammatically correct.

With a single click from within Composer, developers can launch the **bot runtime**, and connect to their bot in the [Bot Framework Emulator](https://github.com/microsoft/BotFramework-Emulator). Once tested in the emulator, the bot runtime can be connected to the [Bot Framework Channel service](https://dev.botframework.com/), and from their... the world!

## The Natural Place for Natural Language

language understanding is a core component of Bot Framework Composer, allowing developers and conversation designers to train language understanding directly in the context of editing a dialog.  

As dialogs are edited in the flow designer, developers can continuously add to their bot's natural language capabilities through a simple markdown-like format that makes it easy to define new intents and provide sample utterances. Bot Framework Composer detects changes and updates the bot's cloud-based NLU model automatically so it is always up to date.

## Bots with character

Creating grammatically correct, data driven responses that also use a consistent tone and convey a clear brand voice has always been a challenge for bot developers! Bot Framework Composer's integrated language generation system allows developers - and the writers who work with them - to create replies with a great deal of flexibility.

With Language Generation (LG), previously complex tasks can be quickly achieved:

* Include dynamic elements in messages
* Generate grammatically correct lists, pronouns, articles
* Provide context-sensitive variation in messages
* Create Adaptive Cards attachments

## Unified Toolset

Under the hood, Bot Framework Composer harnesses the power of many components from the Bot Framework. When building in Composer, developers will have access to:

* Adaptive Dialogs and the Bot Framework SDK
* Natural Language Understanding service from LUIS.ai
* Built-in [Language Generation](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/language-generation) and expression library
* Bot Framework Emulator

After using Bot Framework Composer, the resulting bot project will contain reusable assets in the form of JSON and Markdown files that can be bundled and packaged with a bot's source code. These files can be used with a wide variety of compatible tools from the Bot Framework library.

## Further Reading

* [Bot Framework on Github](https://github.com/microsoft/botframework)

## Next

* [Overview of Bot Framework Composer](overview_of_bfd.md) 
