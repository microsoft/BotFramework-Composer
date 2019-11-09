# Introduction to Bot Framework Composer
Bot Framework Composer is an integrated development tool for developers and multi-disciplinary teams to build bots and other types of conversational software with the Microsoft Bot Framework. Composer enables teams to create bots that use the latest features from the Bot Framework SDK.

![BF Composer](./media/introduction/composer-overview.png)

 Within this tool, you'll find everything you need to build a sophisticated conversational experience:
* A visual dialog editor 
* Tools to train and manage a language understanding component
* A powerful language generation and templating system
* A ready-to-use bot runtime executable 

## Advantage of developing bots with Composer
Developers familiar with the Bot Framework SDK will notice differences between bots developed with it and the Bot Framwork Composer. Below are some of the advantages of developing bots in Composer:
- Adaptive dialogs allow for Language Generation (LG), which can simplify interruption handling and give bots character
- The visual representation and editing in Composer eliminates the need for boilerplate code and makes bot development more accessible
- No longer need to navigate between experiences to maintain LU model as it is editable within the app
- Time saved with fewer steps to set up your environment and start bots

A major difference between the current version of the Bot Framework SDK and Composer is that the apps created using Composer uses the Adaptive dialog format, a JSON specification shared by many tools provided by the Bot Framework. You can find more information about Adaptive dialog [here](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/adaptive-dialog).

You can manage Composer assests, such as Dialogs, LU training data, and message templates like normal developer assets - files that can be committed to source control and deployed alongside code updates.

## Language Understanding

Language Understanding is a core component of Composer, allowing developers and conversation designers to train language understanding directly in the context of editing a dialog.  

As dialogs are edited in Composer developers can continuously add to their bot's natural language capabilities through a simple markdown-like format that makes it easy to define new intents and provide sample utterances.

![BF Composer NLU](./media/introduction/intro-nlu.png)

 Composer detects changes and updates the bot's cloud-based NLU model automatically so it is always up to date.

## Language Generation

Creating grammatically correct, data-driven responses that also use a consistent tone and convey a clear brand voice has always been a challenge for bot developers. Composer's integrated [Language Generation](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/language-generation) system allows developers, and the writers who work with them, to create replies with a great deal of flexibility.

![BF Composer LG](.//media/language_generation/bot_responses.png)

With Language Generation (LG), previously complex tasks can be quickly achieved:
* Include dynamic elements in messages
* Generate grammatically correct lists, pronouns, articles
* Provide context-sensitive variation in messages
* Create Adaptive Cards attachments, as seen above


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
