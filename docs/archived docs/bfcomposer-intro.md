# Introduction to Bot Framework Composer
Bot Framework Composer is an integrated development tool that developers and multi-disciplinary teams can use to build bots. Bot Framework Composer is built using the latest features of the [Bot Framework SDK](https://github.com/microsoft/botframework-sdk).

![BF Composer](./media/introduction/composer-overview.png)

 Within this tool, you'll find everything you need to build a sophisticated conversational experience:
* a visual dialog editor 
* tools to train and manage Language Understanding (LU)
* powerful language generation and templating systems
* a ready-to-use bot runtime executable 

## Advantage of developing bots with Composer
Developers familiar with the Bot Framework SDK will notice differences between bots developed with it and the Bot Framework Composer. Some of the advantages of developing bots in Composer include:
- use of Adaptive Dialogs allow for Language Generation (LG), which can simplify interruption handling and give bots character
- visual design surface in Composer eliminates the need for boilerplate code and makes bot development more accessible. You no longer need to navigate between experiences to maintain LU model as it is editable within the app.
- time saved with fewer steps to set up your environment

A major difference between the current version of the Bot Framework SDK and Composer is that the apps created using Composer uses the Adaptive dialog format, a JSON specification shared by many tools provided by the Bot Framework. You can find more information about Adaptive dialog [here](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/adaptive-dialog).

You can manage Composer assets, such as Dialogs, Language Understanding (LU) training data, and message templates like normal developer assets - files that can be committed to source control and deployed alongside code updates.

## Language Understanding

Language Understanding (LU) is a core component of Composer, allowing developers and conversation designers to train language understanding directly in the context of editing a dialog.  

As dialogs are edited in Composer developers can continuously add to their bots' natural language capabilities through a simple markdown-like format that makes it easy to define new intents and provide sample utterances.

![BF Composer NLU](./media/introduction/intro-nlu.png)

 Composer detects changes and updates the bot's cloud-based NLU model automatically so it is always up to date.

## Language Generation

Creating grammatically correct, data-driven responses that have a consistent tone and convey a clear brand voice has always been a challenge for bot developers. Composer's integrated [Language Generation](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/language-generation) (LG) system allows developers to create bot replies with a great deal of flexibility.

![BF Composer LG](.//media/language_generation/bot_responses.png)

With Language Generation, previously complex tasks can be quickly achieved, like:
* including dynamic elements in messages
* generating grammatically correct lists, pronouns, articles
* providing context-sensitive variation in messages
* creating Adaptive Cards attachments, as seen above

## Unified toolset

Under the hood, Composer harnesses the power of many of the components from the Bot Framework SDK. When building bots in Composer, developers will have access to:

* [Adaptive dialogs](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/adaptive-dialog) and the [Bot Framework SDK](https://github.com/microsoft/botframework-sdk)
* Language Understanding service from [LUIS](https://www.luis.ai/home)
* Built-in [Language Generation](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/language-generation) and [expression library](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/common-expression-language)
* [QnA Maker](https://www.qnamaker.ai/) capabilities
* [Bot Framework Emulator](https://github.com/microsoft/BotFramework-Emulator)

After creating bots with Composer the resulting bot project will contain reusable assets in the form of JSON and Markdown files that can be bundled and packaged with a bot's source code. These files can be used with a wide variety of compatible tools from the Bot Framework.

## Further reading

* [Bot Framework on Github](https://github.com/microsoft/botframework)

## Next

* Learn how to [create an echo bot](./tutorial-create-echobot.md) using Composer
