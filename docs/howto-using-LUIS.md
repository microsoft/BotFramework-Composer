# Using LUIS for Language Understanding 
Language Understanding Intelligent Service ([LUIS](https://www.luis.ai/home)) is a cloud-based API service to build natural language into apps and bots. Adding LUIS to your bots enables them to understand the users' intents conversationally and contextually so that your bots can decide what to respond to the users. Bot Framework Composer provides tools to train and manage language understanding components and it's easier for developers to add LUIS when they develop bots with Composer. In this article, we will walk you through the steps to use LUIS when you develop your bots with Bot Framework Composer. To further explore how to use LUIS in Bot Composer, you may refer to the [LUIS Sample](https://github.com/microsoft/BotFramework-Composer/tree/master/SampleBots/ToDoLuisBot/ComposerDialogs). 

## Prerequisites 
- Basic knowledge of language understanding (concept article [here](https://github.com/microsoft/BotFramework-Composer/blob/kaiqb/Ignite2019/docs/concept-language-understanding-draft.md))
- Basic knowledge of events and triggers (concept article [here](https://github.com/microsoft/BotFramework-Composer/blob/kaiqb/Ignite2019/docs/concept-events-and-triggers-draft.md))
- LUIS account (apply [here](https://www.luis.ai/home))
- LUIS authoring key (how to get [here](https://docs.microsoft.com/en-us/azure/cognitive-services/luis/luis-concept-keys?tabs=V2#programmatic-key))

## How to add LUIS 
To determine user's intent, in Composer you define the `Handle an Intent` trigger, and then specify the actions to take when an **Intent** is recognized (and optionally **entities**). For more details please read the [events and triggers](https://github.com/microsoft/BotFramework-Composer/blob/kaiqb/Ignite2019/docs/concept-events-and-triggers-draft.md) article. 

Composer currently supports two types of recognizers: LUIS recognizer (default) and Regular Expression Recognizer. You can only choose one type of recognizer for each dialog. Besides the recognizer, each dialog may contain a set of language understanding data authored in [.LU format](https://github.com/microsoft/botbuilder-tools/blob/master/packages/Ludown/docs/lu-file-format.md).  

In this section, we will cover the steps to use LUIS as recognizer in your bot. These steps include the following: set a recognizer type for each dialog, author language understanding tranining data, publish your LU data, and test them in Emulator. 

### Set LUIS as recognizer 
In Composer, each dialog can have one type of recognizer and might contain a set of language understanding trainining data. To add LUIS to your bot, you need to select LUIS as the recognizer type for the specific dialog you want to define. You need to do the following two things:

- select the dialog 
- select LUIS as recognizer type

![luis_recognizer](./media/add_luis/luis_recognizer.png)

### Author LU 
Compose your language understanding training data in the LU editor. The training data should follow the [.lu file format](https://github.com/microsoft/botbuilder-tools/blob/master/packages/Ludown/docs/lu-file-format.md) and is ususally composed of two parts: intents and example utterances. You can author as many intents as you wish to include in the specific dialog. The following screenshot shows **Greeting** and **CheckWeather** intents along with the related utterances.

![author_lu](./media/add_luis/author_lu.png)

### Define the `Handle an Intent` trigger 
After you compose the language understanding training data in specific dialog, you need to define a `Handle an Intent` trigger to handle the pre-defined intents. The `Handle an Intent` trigger is a type of event handler specialized to work with the **Recognizers**. Each `Handle an Intent` trigger handles one intent. 

#### Create a `Handle an Intent` trigger 
One the Composer menu, select the dialog you want to create the `Handle an Intent` trigger and then click **New Trigger**. 

![create_trigger](./media/add_luis/create_trigger.png)

In the pop-up window, select `Handle an Intent` as the type of the trigger from the drop-down menu. Then select the **intent** you want to handle with this trigger from the drop-down menu and click **Submit**. 

![configure_intent](./media/add_luis/configure_intent.png)

You need to define a `Handle an Intent` trigger for each **intent**. After the definition, you will see the name of the intent shown inside the trigger node. 

![show_intent_in_trigger](./media/add_luis/show_intent_in_trigger.png)

#### Add action to the `Handle an Intent` trigger 
After you are done with your trigger definition and configuration to specific intent, you can add action to be executed after the event handler is triggered. For example, you can send a response message. 

Click the "+" sign below the trigger node and select **Send a response**. 

![send_response_message](./media/add_luis/send_response_message.png)

Define the response message in the language generation editor in the [.lg file format](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md). 

![response_message](./media/add_luis/response_message.png)

You can add your desired action to each `Handle an Intent` trigger. 

### Publish 
When you finish defining all the triggers and language understanding training data as needed, you can publish your LU model from Composer to LUIS. 

Click **Start Bot** on the upper right corner of your Composer, fill in your LUIS authoring key and click **Publish**. 

![publish_luis](./media/add_luis/publish_luis.png)

Any time you hit **start bot** (or **restart bot**), Composer will evaluate if your LU content has changed. If so Composer will automatically make required updates to your LUIS applications, train and publish them. If you go to your LUIS app website, you will find the newly published LU model. 

### Test 
To test your bot which you just added LUIS to, click the **Test in Emulator** button on the upper right corner of your Composer. When you emulator is running, send in messages indicating different intents to see if they match the pre-defined intents you have created in your triggers. 

![emulator](./media/add_luis/emulator.gif)

## References 
- [LUIS.ai](https://www.luis.ai/home)
- [Add natural language understanding to your bot](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-v4-luis?view=azure-bot-service-4.0&tabs=csharp)
- [Events and triggers](https://github.com/microsoft/BotFramework-Composer/blob/kaiqb/Ignite2019/docs/concept-events-and-triggers-draft.md) 
- [Language Understanding](https://github.com/microsoft/BotFramework-Composer/blob/kaiqb/Ignite2019/docs/concept-language-understanding-draft.md)

## Next 
TBD

