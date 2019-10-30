# Introduction to Bot Framework Composer
Bot Framework Composer is an integrated development tool for developers and multi-disciplinary teams for building bots and other types of conversational software with the Microsoft Bot Framework.

![BF Composer](./media/introduction/overview.png)

 Within this tool, you'll find everything you need to build a sophisticated conversational experience:
* A visual dialog editor 
* Tools to train and manage a language understanding component
* A powerful language generation and templating system
* A ready-to-use bot runtime executable

Bot Framework Composer enables teams to create bots that use the latest features from the Bot Framework SDK. 

## Advantage of developing bots BotFramework Composer
Developers familiar with the Bot Framework SDK will notice differences between bots developed with it and the Bot Framwork Composer. The table below details key differences in both structure and functionality of elements associated with each type of bot:

| Differences | Bots developed with *BF SDK* | Bots developed with *BF Composer*| Advantages | 
|---|---|---|---|
| Dialog structure | Combination of waterfall, prompt, component dialogs | Combination of adaptive dialogs | Able to leverge Language Generation (LG) with adaptive dialogs, which in turn allows for makes 1. Developing bots with personality 2. Handle interruptions easily |
| Development environment | Write code (boilerplate and custom logic) in IDE | Drag-and-drop UI in BF Composer IDE| Lower barrier to entry for developers as they don't need to write custom code |
| Runtime environment | Devleop bot locally, run in Emulator after entering credentials | Click "start bot", once started "click test in emulator"| Less time setting up environment and less steps needed to start a bot |
| Language Understanding (LU) | Add LUIS credentials and methods to bot code, train models in LUIS | In-app LU | No longer need to set up or maintain LU model as it is maintained within app |

As mentioned above, a major difference between the current version of the Bot Framework SDK and Bot Framework Composer is that the apps created using the Composer uses the Adaptive Dialog format, a JSON specification shared by many tools provided by the Bot Framework. You can find more information about Adaptive Dialog [here](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/adaptive-dialog).

You can manage BF Composer assests, such as Dialogs, LU training data, and message templates like normal developer assets - files that can be committed to source control and deployed alongside code updates.

Overall the Bot Framework Composer makes it simpler and quicker for both experienced and novice developers to create robust bots by visualizing dialogs, leveraging language generation (LG) to simplify complex tasks (interruption, developing bots with character, etc), reducing the number of steps necessary to gets bots running, and keeping and training of the NLU components of your bot all within the Bot Framework Composer.
<!--
## Bot Runtime Executable
- easier process
    - traditional bot: 5 steps
        - develop/code in IDE > build and deploy locally > launch emulator > fil in emulator credentials > connect and run bot
    - BF Composer bot: 3 steps
        - develop in composer IDE (NLU integrated) > start bot > connect and run in Emilator
--->

## Language understanding (LU)

Language understanding is a core component of BF Composer, allowing developers and conversation designers to train language understanding directly in the context of editing a dialog.  

As dialogs are edited in the designer, developers can continuously add to their bot's natural language capabilities through a simple markdown-like format that makes it easy to define new intents and provide sample utterances.

![BF Composer NLU](./media/introduction/intro-nlu.png)

 Bot Framework Composer detects changes and updates the bot's cloud-based NLU model automatically so it is always up to date.

## Language Generation (LG)

Creating grammatically correct, data-driven responses that also use a consistent tone and convey a clear brand voice has always been a challenge for bot developers. Bot Framework Composer's integrated [language generation](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/language-generation) system allows developers - and the writers who work with them - to create replies with a great deal of flexibility.

![BF Composer LG](.//media/language_generation/bot_responses.png)

With Language Generation (LG), previously complex tasks can be quickly achieved:
* Include dynamic elements in messages
* Generate grammatically correct lists, pronouns, articles
* Provide context-sensitive variation in messages
* Create Adaptive Cards attachments, as seen above


## Unified toolset

Under the hood, Bot Framework Composer harnesses the power of many of the components from the Bot Framework SDK. When building bots in Composer, developers will have access to:

* [Adaptive Dialogs](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/adaptive-dialog) and the [Bot Framework SDK](https://github.com/microsoft/botframework-sdk)
* Natural Language Understanding service from [LUIS](https://www.luis.ai/home)
* Built-in [Language Generation](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/language-generation) and [expression library](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/common-expression-language)
* [QnA Maker](https://www.qnamaker.ai/) capabilities
* [Bot Framework Emulator](https://github.com/microsoft/BotFramework-Emulator)

After creating bots with Bot Framework Composer, the resulting bot project will contain reusable assets in the form of JSON and Markdown files that can be bundled and packaged with a bot's source code. These files can be used with a wide variety of compatible tools from the Bot Framework library.

## Further reading

* [Bot Framework on Github](https://github.com/microsoft/botframework)

## Next

* Learn how to [create an echo bot](./tutorial-create-echobot.md) using Composer
