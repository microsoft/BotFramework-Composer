# Language understanding

Language understanding (LU) is used by the bot to understand language naturally and contextually to determine what next to do in a conversation flow. In Bot Framework Composer,the process is achieved through setting up recognizers and providing training data in the dialog so that any **intents** and **entities** contained in the message can be captured. These values will then be passed on to hanlders which define how bots will respond with appropriate actions. 

In Bot Framework Composer LU has the following characteristics:

- LU content is authored in inline editor using [.lu file format](https://github.com/Microsoft/botbuilder-tools/blob/master/packages/Ludown/docs/lu-file-format.md)
- LU content is trainining data for recognizers 
- Composer currently supports LU technologies such as LUIS and Regular Expression 
- Composer provides an all-up LU view in "User Responses"

## Core LU concepts in Composer 
Before we talk about the LU authoring experience in Composer, it is important to cover some core LU concepts and how they manifest in Composer. 

### Intents  
Intents are categories or classifications of user intentions. An intent has a twofold meaning in Composer. On the one hand, an intent is a purpose or goal expressed in a user's utterance. By providing different example utterances, you can train your bot's understanding for specific intents. On the other hand, an intent represents an action that the user wants to take. When an intent is captured, its matching action will execute. The basic idea of how intents work in Composer is as follows: 

- You set up recognizers and author LU content as training data. 
- Based on the LU content your bot will capture some intent on user's input. 
- When an intent is identified, an associated trigger causes an action to execute. 

To define intents in Composer, you will need to:

- define intent(s) and example utterances in a dialog 
- create an **Intent** trigger in the same dialog to wire up the pre-defined intents

### Utterances 
Utterances are input from users and may have a lot of variations. Since utterances are not always well formed we need to provide example utterances for specific intents to train our bots to recognize intents from different utterances. By doing so, our bots will have some "intelligence" to understand human languages. 

In Composer, utterances are always captured in a markdown list and followed by an intent. For example, a **Greeting** intent with some example utterances may look like this: 

    # Greeting 
    - Hi 
    - Hello 
    - How are you? 

You may have noticed that LU format is very similar to LG format but they are different. 

- LU is for bots to understand user's input (primarily capture **intent** and more)
- LU is associated with recognizers (LUIS/Regular Expression)
- LG is for bots to respond to users as outputs 
- LG is associated with language generator 

### Entities
Entities are a collection of objects data extracted from an utterance such as places, time, and people. Entities and intents are both important data extracted from utterances, but they are different. An intent indicates what the user is trying to do. An utterance may include several entities or no entity, while an utterance usually represents one intent. In Composer, all LU entities are defined and managed inline. 

### Example 

| Intent     | Utterances                                    | Entity values (can be varied)          |
| ---------- | --------------------------------------------- | ----------------------- |
| BookFlight | "Book me a flight to London"                  | "London"                |
|            | "Fly me to London on the 31st"                | "London", "31st"        |
|            | "I need a plane ticket next Sunday to London" | "next Sunday", "London" |

An example JSON view of the query "book me a flight to London" in LUIS app.  

```json
   {
  "query": "book me a flight to london",
  "prediction": {
    "normalizedQuery": "book me a flight to london",
    "topIntent": "BookFlight",
    "intents": {
      "BookFlight": {
        "score": 0.9023853
      }
    },
    "entities": {}
  }
}
```

## Author LU content in Composer 
### User scenario 
To enable your bot understand user's input contextually and conversationally so that your bot can decide how to respond to different user inputs, you should author LU as training data. 

### What to know
To author proper LU content in Composer, you need to know 
  - LU concepts
  - [.lu file format](https://github.com/Microsoft/botbuilder-tools/blob/master/packages/Ludown/docs/lu-file-format.md)
  - [Common expression language](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/common-expression-language#readme)

### How to author 
To create custom the LU content, follow these steps:

- set up a **Recognizer** for a specific dialog (per dialog per recognizer)
- author LU content as training data in [.lu format](https://github.com/Microsoft/botbuilder-tools/blob/master/packages/Ludown/docs/lu-file-format.md)
- wire up the LU content with specific dialog 
- publish LU content (for LUIS) 

#### Step one: Set up a recognizer for specific dialog 
Composer currently support two types of recognizers: LUIS (by default) and Regular Expression. Before setting up a recognizer type, you need to select the dialog for which you want to customize your LU content. For example, let's select the main dialog and then set up LUIS as recognizer type. 

1. Go to your bot's navigation pane on the left side and select the main dialog. 

![select_dialog](./media/language_understanding/select_dialog.png)

2. When you see the Language Understanding editor on the right side panel, select **LUIS** as its **Recognizer Type**. 

![luis](./media/language_understanding/luis.png)

#### Step two: Author LU content 
After you set up the recognizer type, you can customize your LU content in the editor using the [.lu format](https://github.com/Microsoft/botbuilder-tools/blob/master/packages/Ludown/docs/lu-file-format.md).

For example, let's define two intents: **Greeting** and **CheckWeather** with some example utterances inline: 

![intents](./media/language_understanding/intents.gif)

#### Step three: Wire up LU with **Intent** trigger 
After you define the intents with example utterances, you need to create **Intent** triggers in the dialog to wire up each intent. The **Intent** trigger defines the actions to take when an intent is recognized. 

1. Go to your bot's navigation pane on the left side and select **New Trigger** in the dialog you wish you create the trigger. 

![new_trigger](./media/language_understanding/new_trigger.png)

2. In the `Create a trigger` pop-up window, select **Intent** as the type of trigger. Pick the intent you want to handle from the drop-down menu and then click **Submit**. 

![wireup_intent](./media/language_understanding/wireup_intent.png)

#### Step four: Publish LU (LUIS)
Now you have completed the process of providing LU content as training data and you can view your LU content in an all-up view. Click "User Input" icon on the left side menu. 

![user_say](./media/language_understanding/user_say.png)

The all-up view lists all LU content you have authored and some details such as which dialog you define the content and whether it is published or not.  

![all_up_view](./media/language_understanding/all_up_view.png)

Now the last step is to publish your LU content to LUIS. 

Click **Start Bot** on the upper right corner of your Composer, fill in your LUIS authoring key and click **Publish**. If you do not have a LUIS account, you need to apply one first from [here](https://www.luis.ai/home). If you have a LUIS account but do not know how to find your LUIS authoring key please read [here](https://docs.microsoft.com/en-us/azure/cognitive-services/luis/luis-concept-keys?tabs=V2#programmatic-key). 

![publish_luis](./media/add_luis/publish_luis.png)

Any time you hit **Start Bot** (or **Restart Bot**), Composer will evaluate if your LU content has changed. If so Composer will automatically make required updates to your LUIS applications, train and publish them. If you go to your LUIS app website, you will find the newly published LU model. 

## References
- [What is LUIS](https://docs.microsoft.com/en-us/azure/cognitive-services/luis/what-is-luis)
- [Language understanding](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-concept-luis?view=azure-bot-service-4.0)
- [.lu file format](https://github.com/Microsoft/botbuilder-tools/blob/master/packages/Ludown/docs/lu-file-format.md)
- [Common expression language](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/common-expression-language#readme)
- [Using LUIS for language understanding](https://github.com/microsoft/BotFramework-Composer/blob/kaiqb/Ignite2019/docs/howto-using-LUIS.md)

## Next 
Learn how to [send messages to users](howto-sending-messages.md)
