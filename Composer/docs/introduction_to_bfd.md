# Introduction to Bot Framework Designer

> How BFD works, what is the output, how does it relate to a running bot.  
> Top level concepts and terminology  

Bot Framework Designer is an integrated development environment (IDE) for building bots and other types of conversational software with the Microsoft Bot Framework technology stack. Inside this web-based tool, you'll find everything you need to build a modern, state-of-the-art conversational experience:

* A visual dialog designer
* Tools to train and manage a language understanding (NLU) component
* A powerful language generation and templating system
* A ready-to-use bot runtime executable

Bot Framework Designer enables teams working to create bots to build all kinds of conversational experiences that use the latest features from the Bot Framework SDK **without writing code**. The Designer app reads and writes from the Adaptive Dialog format, a JSON specification shared by many tools provided by the Bot Framework. Dialogs, NLU training data and message templates are treated like normal developer assets - files that can be committed to source control and deployed alongside code updates.

## Building Blocks

Modern conversational software is comprised of a many components, including programming code, custom business logic, cloud APIs, training data for language processing systems and perhaps most importantly, the actual content and copy used in conversations with the bot's end users.  

With Bot Framework Designer, all of these pieces are integrated with one another into a single interface for constructing blocks of bot functionality called "Dialogs." 

Each dialog represents a piece of the bot's functionality. They contain instructions for how the bot will react to input. Simple bots will have a few dialogs. Complex bots may have dozens or hundreds of individual dialogs.

Dialogs contain a series of actions that the bot will undertake to fulfill a user's request. Each action is a step the bot will take as it responds - sending messages, making calculations, performing computational tasks on behalf of the user. The path the bot follows through the dialog can branch and loop. The bot can ask questions, validate input, manipulate and store values in memory, and make decisions.

Dialogs also contain event handlers - rules that tell the bot how to process incoming messages. The most common use of event handlers is to launch a dialog in response to a request. However, they are also used to define a wide variety of bot behaviors such as providing context-specific help, and responding to a requests to quit or cancel, or handling custom, developer-defined events originating from the app itself.

With a single click from within Designer, developers can launch the bot runtime, and connect to their bot in the Bot Framework Emulator. Once tested in the emulator, the bot runtime can be connected to the Bot Framework Channel service, and from their... the world!
