# Advanced intent and entity definition 
Entities are a collection of objects data extracted from an utterance such as places, time, and people. Entities need to be labeled consistently across all training utterances for each intent in a model. While intents are required, entities are optional. An utterance can include many entities or none at all, depending on the data required for your client application to perform its task. 

In this article, we will cover how multiple entities are defined and extracted by LUIS and how different types of entities are defined. 

## Prerequisites: 
- basic knowledge of [intent and entity](concept-language-understanding.md#core-lu-concepts-in-composer)
- basic knowledge of [how to define an intent trigger](howto-defining-triggers.md#intent)
- LUIS account (apply [here](https://www.luis.ai/home))
- LUIS authoring key (how to get [here](https://docs.microsoft.com/en-us/azure/cognitive-services/luis/luis-concept-keys?tabs=V2#programmatic-key))

## LUIS for entity extraction 
In addition to specifying intents and utterances, it is also possible to train LUIS to recognize named entities and patterns. Entities are a collection of objects data extracted from an utterance such as places, time, and people. Read more about the full capabilities of LUIS recognizers [here](https://github.com/microsoft/botbuilder-tools/blob/master/packages/Ludown/docs/lu-file-format.md). 

Extracted entities are passed along to any triggered actions or child dialogs using the syntax `@[Entity Name]`. For example, given an intent definition like below: 

```
# book-flight
- book a flight to {city=austin}
- travel to {city=new york}
- i want to go to {city=los angeles}
```
When triggered, if LUIS is able to identify a city, the city name will be made available as `@city` within the triggered actions. The entity value can be used directly in expressions and LG templates, or [stored into a memory property](concept-memory.md) for later use. More details about intents and entities used in Composer can be found [here](concept-language-understanding.md). 

the JSON view of the query "book me a flight to London" in LUIS app looks like this: 

```json
{
  "query": "book me a flight to london",
  "prediction": {
    "normalizedQuery": "book me a flight to london",
    "topIntent": "BookFlight",
    "intents": {
      "BookFlight": {
        "score": 0.9345866
      }
    },
    "entities": {
      "city": [
        "london"
      ],
      "$instance": {
        "city": [
          {
            "type": "city",
            "text": "london",
            "startIndex": 20,
            "length": 6,
            "score": 0.834206,
            "modelTypeId": 1,
            "modelType": "Entity Extractor",
            "recognitionSources": [
              "model"
            ]
          }
        ]
      }
    }
  }
}
```

## Entities of different types

### Simple entity 

### List entity 

### RegEx entity 


# Further reading
- [Entities and their purpose in LUIS](https://docs.microsoft.com/en-us/azure/cognitive-services/luis/luis-concept-entity-types)
- [.lu file format](https://github.com/microsoft/botbuilder-tools/blob/master/packages/Ludown/docs/lu-file-format.md)

