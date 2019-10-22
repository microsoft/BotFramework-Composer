# Language Understanding in Bot Composer

Language Understanding (LU) is the process for a bot to understand language naturally and contextually so a bot will decide what to do next in a conversation flow. The process is achieved via identifying and extracting intents and entities contained in the message. These values will be passed on to event hanlders which defines how bots will respond with appropriate actions. 

LU in Bot Framework Composer has the following characteristics:

- Streamline language understanding concepts to line up with the rest of the bot parts, e.g. alignment with dialog
- Enable users to author language understanding concepts contextually
- Based on specific language understanding technology
  - **Manage the E2E development-time** lifecycle (create / update -> train -> publish) for all LU models 
  - **Wire up** the LU models appropriately to work with the rest of the technology stack such as dialog 
- Support LUIS and regix recognizer as the initial set of LU technologies 
- Provide an all-up view (per dialog) for users to view and edit 
- language understanding concepts authored by user is in simple .lu format and serialized down to .lu files

## Core LU Concepts in Composer 

### Intents  
Intents are categories of user intentions. An intent is a purpose or goal expressed in a user's utterance. An intent also represents an action that the user wants to take. When an intent is captured, its matching action will fire. 

### Utterances 
Utterances are input from users and may have a lot of variations. Each intent needs examples of user utterances, and each utterance can provide a variety of data that needs to be extracted with entities. Utterances are not always well formed. In Composer, utterances are always captured in a markdown list. 

### Entities
Entities are a collection of objects data extracted from an utterance such as places, time, and people. Entities and intents are both important data extracted from utterances, but they are different. An intent presents the prediction of the entire utterance. An utterance can include several entities or no entity, while an utterance usually represents one intent or no intent at all. In BF Composer, all LU entities are defined and managed inline with utterances they are used. 

### Example 

| Intent     | Utterances                                    | Entity values           |
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

## Authoring LU in Composer 
### When to author
Here are a few user scenarios when you need to author LU in Composer:
1. 

### What to know
To author an LU template in Composer, you need to know 
  - Supported concepts of LU 
  - [.lu File Format](https://github.com/Microsoft/botbuilder-tools/blob/master/packages/Ludown/docs/lu-file-format.md)
  - [Common Expression Language](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/common-expression-language#readme)

### How to author 
- set up a dialog with specific recognizer (per dialog per recognizer)
- author .lu file following the [.lu file format](https://github.com/Microsoft/botbuilder-tools/blob/master/packages/Ludown/docs/lu-file-format.md) 
- (for LUIS) publish 
#### Examples 
  - plain text uttarances 
  - plan text with labelled entity references 
  - entity reference with role attribution 
  - patterns 
  - with explicity entity definition 

## References
- [What is LUIS](https://docs.microsoft.com/en-us/azure/cognitive-services/luis/what-is-luis)
- [language Understanding](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-concept-luis?view=azure-bot-service-4.0)
- [Language Understanding in Bot Framework Designer](Vishwac Sena Kannan)
- [.lu File Format](https://github.com/Microsoft/botbuilder-tools/blob/master/packages/Ludown/docs/lu-file-format.md)
- [Common Expression Language](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/common-expression-language#readme)

## Next 
[Memory in Composer](https://github.com/microsoft/BotFramework-Composer/blob/kaiqb/Ignite2019/docs/concept-memory-draft.md)

## Questions
1. User scenarios of LG and LU 
2. When using LUIS as recognizer, do we need to train the data then publish? When does the training take place? does the training of data even take place? 
3. LUIS does not support entity setting in Composer (only intents) 
4. Regix Recognizer supports definition of patterns, entity. Not sure if they are workable/available. yarn  
5. How to reference his lu specification article? 