# Events and Triggers
<!-- This article is primarily based on the original [events and triggers](https://github.com/microsoft/BotFramework-Composer/blob/master/docs/triggers_and_events.md) doc.  -->

Like most event-driven architecture, events, triggers, and handlers are three basic elements in Bot Composer. An event is an abstract idea which indicates that something has occurred. When a bot starts at runtime, its main dialog is activated and an event occurs. In order to respond to events, we declare a trigger or a set of triggers to handle the events. In Bot Composer, we use event handlers to declare triggers.   

Each dialog in Composer includes a set of event handlers that contain instructions for how the bot will respond to inputs received when the dialog is active. When a bot receives a message, an event of the type `activityReceived` is fired. As the message is processed by the recognizer and passed through the dialog system, other events of different types are fired. If an event handler is found to handle an incoming event, that event is considered handled, and processing of further event handlers stops. If no event handler is found, the event will pass through the bot with no additional actions taken. 

## Types of Event Handlers  
There are several different types of event handlers available within Composer. They all work in a similar manner, and in some cases, can be interchanged. This section will cover the concepts event handlers in Composer and in what scenarios they will be used. You can refer to the [Defining Triggers]() article for detailed description of how to define each type of them. 

### Handle Dialog Events  

The base type of event handlers are dialog event handlers. Almost all events start as dialog events which are related fo the "lifecycle" of the dialog. Currently, there are two dialog event handlers in the Composer menu: `Handle a Dialog Event` and `Handle an Event: BeginDialog`. Most dialogs will include an event handler configured to respond to the `BeginDialog` event, which fires when the dialog begins and allows the bot to respond immediately. 

Use event handlers when you want to do things like:

    - Take actions immediately when the dialog starts, even before the recognizer is called
    - Take actions when a "cancel" signal is detected
    - Take automatic action on every message as it is received or sent
    - Evaluate the raw content of the incoming activity

### Handle Intent Events  

Intent handlers are special types of event handlers that have been specialized to work with the Recognizers. There are two intent handlers in the Composer menu: `Handle an Intent` and `Handle Unknown Intent`. After the first round of events is fired, the bot will pass the incoming activity through the configured Recognizer. If an intent is captured, the intent will be passed onto the matching handler along with any entity values the message contains. If an intent is not detected by the recognizer, any congifured "Unknown Intent" handlers will fire. This will only fire if no matching intent handler is found.   

Use intent handlers when you want to do things like:

    - Trigger major features of your bot using natural language
    - Recognize common interuptions like "help" or "cancel" and provide context-specific responses
    - Extract and use entity values as parameters to your dialog or a child dialog

### Handle Specialized Events 

There are some event handlers used to handle specialized events, such as `Handle ConversationUpdate`. This event handler tracks the event when a user first joins the chat and is usually used to send a greeting. This specialized option is provided to avoid handle an event with a complex condition attached. 

<!-- What are the two types mentioned? Did he mean intent handlers?  -->
<!-- There no mention to Handle ConversationUpdate  -->
<!-- why Handle an intent and handle unknown intent are seperate when handle unknown intent is a type of handle an intent.   -->
<!-- Since BeginDialog is an event handler within Handle a Dialog Event, why it is designed as a seperate type of event handler? Should Handle an Event: BeginDialog be merged to Handle a Dialog Event?  -->

## Anatomy of an Event Handler

The basic idea behind an event handler is "When (EVENT) happens, then do (ACTIONS)". The trigger is a conditional test on an incoming event, while the actions are one or more programmatic steps the bot will take to fulfill the user's request.

The screenshot below shows the definition of an intent handler that is configured to fire whenever the "cancel" intent is detected. It is possible to add a secondary constraint to the event - this expression, if specified, must evaluate to be "true" for the event to fire. 

<p align="left">
    <img alt="anatomy_event_handler" src="./media/events_triggers/anatomy_event_handler.png" style="max-width:300px;" />
</p>

This event will appear in the dialog as a node at the top of the editor. Actions within this event handler occur inside the context of the active dialog. These steps control the main functionality of a bot.

<p align="left">
    <img alt="cancel_handler" src="./media/events_triggers/cancel_handler.png" style="max-width:200px;" />
</p>

## Defining Triggers with Recognizers 

### LUIS Recognizer
Bot Composer enables developers to create language training data within the dialog editing interface since it is deeply integrated with the [LUIS.ai](https://www.luis.ai/home) language understanding API. LUIS is able to take natural language input from users and translate it into a named intent and a set of extracted entity values the message contains. The content is managed by [LUDown](https://github.com/microsoft/botbuilder-tools/tree/master/packages/Ludown), a command line tool that helps covert [.lu file(s)](https://github.com/microsoft/botbuilder-tools/blob/master/packages/Ludown/docs/lu-file-format.md) into JSON files for language processing applications such as [LUIS](http://luis.ai/) and [QnA](https://www.qnamaker.ai/) knowledge base. 

To define triggers with LUIS recognizer you need to:
1. In the dialog context, choose **LUIS** as recognizer type (by default)
2. In the dialog context, create **intents** with sample utterances and follow the [.lu format file](https://github.com/Microsoft/botbuilder-tools/blob/master/packages/Ludown/docs/lu-file-format.md#lu-file-format). 
Each intent contains a series of sample utterances which will be used as training data in LUIS to recognize the intent. 

    <p align="left">
        <img alt="LUIS_intent" src="./media/events_triggers/LUIS_intent.png" style="max-width:300px;" />
    </p>

3. Define `Intent Handlers` as `New Triggers`for each intent and configure each `Intent Handler` with specific intent. 
   
    <p align="left">
        <img alt="BookFlight_configure" src="./media/events_triggers/BookFlight_configure.png" style="max-width:300px;" />
    </p>


In addition to specifying intents and utterances, it is also possible to train LUIS to recognize named entities and patterns. Read more about the full capabilities of LUIS recognizers [here](https://github.com/microsoft/botbuilder-tools/blob/master/packages/Ludown/docs/lu-file-format.md). 

Extracted entities are passed along to any triggered actions or child dialogs using the syntax memory path `@[Entity Name]`. For example, given an intent definition like below:

```
# book-flight
- book a flight to {city=austin}
- travel to {city=new york}
- i want to go to {city=los angeles}
```

When triggered, if LUIS is able to identify a city, the city name will be made available as `@city` within the triggered actions. The entity value can be used directly in expressions and LG templates, or [stored into a memory property](using_memory.md) for later use.

### Regular Expression Recognizer 
[Regular expressions](https://regexr.com/) are rigid patterns that can be used to match simple or sophisticated patterns in text. Composer exposes the ability to define intents via regular expressions, and also allows the regular expressions to extract simple entity values. While LUIS offers the flexibility of a more fully featured language understanding technology, [Regular expression recognizer](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/adaptive-dialog/docs/recognizers-rules-steps-reference.md#regex-recognizer) works well when you need to match a narrow set of highly structured commands or keywords.

In the example below, a similar book-flight intent is defined. However, this will ONLY match the very narrow pattern "book flight to [somewhere]", whereas the LUIS recognizer will be able match a much wider variety of messages.

To define triggers with Regular Expression recognizer you need to: 
1. In the dialog context, choose **Regular Expression** as recognizer type (by default)
2. In the dialog context, create Regular Expression **intents** and **pattern**.

    <p align="left">
        <img alt="regular_expression_recognizer" src="./media/events_triggers/regular_expression_recognizer.png" style="max-width:300px;" />
    </p>

3. Define `Intent Handlers` as `New Triggers`for each intent and configure each `Intent Handler` with specific intent as shown in the last step of defining LUIS recognizer. 

## Related Reading 
[Events vs Triggers](http://ftp.magicsoftware.com/www/help/unipaas/mergedprojects/technical%20notes/Events,_Triggers,_and_Handlers.htm)

[LUIS.ai docs](https://docs.microsoft.com/en-us/azure/cognitive-services/luis/what-is-luis)

[Adaptive Dialog[_Preview_]](https://github.com/Microsoft/BotBuilder-Samples/tree/master/experimental/adaptive-dialog#readme)

[Adaptive dialog: Recognizers, rules, steps and inputs](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/adaptive-dialog/docs/recognizers-rules-steps-reference.md#Rules)

[Language Generation[_Preview_]](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/language-generation)

## Next 
[Defining Triggers](https://github.com/microsoft/BotFramework-Composer/blob/master/docs/triggers_and_events.md)
