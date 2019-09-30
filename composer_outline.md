# Bot Composer Docs TOC

## P0

### Overview
- [Introduction to Bot Framework Composer](https://github.com/microsoft/BotFramework-Composer/blob/master/docs/introduction_to_bfd.md) 
  - Explain adavantages of using bot composer
  - Use illustration to show the BF Composer design surface 
- Known Issues (TBD)

### QuickStart
- Create your first bot 
  - Create Echo bot using the BF Composer template, test, and run
### Samples 
- Bot Framework Composer samples 
### Concepts 
- [Dialogs](https://github.com/microsoft/BotFramework-Composer/blob/master/docs/introduction_to_bfd.md#building-blocks)
- [Triggers and Events](https://github.com/microsoft/BotFramework-Composer/blob/master/docs/triggers_and_events.md)
- [Conversation flow using Memory model](https://github.com/microsoft/BotFramework-Composer/blob/master/docs/using_memory.md) 
- [Language generation](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/adaptive-dialog/docs/language-generation.md)
- Language understanding

### How to
#### Set up
- Docker
- Yarn
#### Develop
- Sending messages (use updated terminology in BFD)
   - Use simple text and LG
- Asking for user input 
  - Use numbers, dates and time, confirmation, multiple choices 
- [Controlling conversation flow](https://github.com/microsoft/BotFramework-Composer/blob/master/docs/controlling_conversation_flow.md)
- Adding LUIS to your bot
- Adding QnA to your bot
- Sending cards (few of them)
- [Defining triggers and events (focus on LUIS)](https://github.com/microsoft/BotFramework-Composer/blob/master/docs/triggers_and_events.md)
- Handling interruption 
#### Test
- [Test in Emulator](https://github.com/microsoft/BotFramework-Composer/blob/master/docs/testing_debugging.md)
#### Deploy
- Deploy bots to Azure using az cli and ARM templates
### Resources
- [Common Expression Language](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/common-expression-language/prebuilt-functions.md)

## P1
**Using OAUTH**

**Calling back-end services**

**Language Understanding authoring and format**

**Advance trigger and entities**

**Input and entities (dealing with multiple entities, Consultation and Cross training , etc.)**

**Creating a Skill**

**Patterns:** 
- Menu (with fallback)
- asking a question for single entity (with retry)
- Confirmation
- filling multiple slots with entities and triggers (define an event that handles multiple entities)
