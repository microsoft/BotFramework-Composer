# Sending messages
The primary way a bot communicates with users is through message activites. Some messages may simply consist of plain text, while others may contain richer content such as cards or attachments. In this article, we will cover the different types of text messages you can user in Composer and how to use them. We use the examples provided in the [Messages_Samples](https://github.com/microsoft/BotFramework-Composer/tree/master/SampleBots/Message_Samples/ComposerDialogs) throughout this article. 

## User scenarios
When your bot receives messages from the user, any **Intents** and ***Entity values** will be extracted and passed on to the dialog's event handler, from there you can define how your bot should respond to the users. Sending messages back to the user is one type of action you can define in the event handler.

Below is a screenshot of the **Send Messages** action component in Composer: 

![message_menu](./media/send_messages/message_menu.png)

> [!NOTE] All types of triggers have the **Send Messages** action component. The **Handle ConversationUpdate** trigger is one type of trigger used here for demo purposes. 

## What to know
In BF Composer, all messages sending back to the user follow the [.lg file format](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md). If you are not familiar with language generation in BF Composer, please read the [language generation concept article](https://github.com/microsoft/BotFramework-Composer/blob/kaiqb/Ignite2019/docs/concept-language-genereation-draft.md). 

The table below lists the five different types of text messages provided in BF Composer and their respective descriptions. 

| Message Type       | Description   |  
| -------------------- |-------------- |
| Simple Text       | To define the actions to take when an **Intent** is recognized (and optionally **entities**) |
| Text With LG       | To define the actions to taken when no intent is recognized  |
| Text With Memory   | To define the actions to take when a dialog event such as `BeginDialog` is fired |
| LG With Param    | To define the actions to take when an activity event such as `ConversationUpdate` is fired |
|LGComposition |  n/a  |

## Defining different text messages
To send a message, you need to specify **Send an Activity** and then in the the language generation inline editor author your response message in [.lg format](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md). 

### Simple Text
To define a simple text message, use a "-" before the text that your want your bot to respond to users. 

     - Here is a simple text message. 

Below is a screenshot of the simple text message example in the [Messages_Samples](https://github.com/microsoft/BotFramework-Composer/tree/master/SampleBots/Message_Samples/ComposerDialogs): 

![simple_text](./media/send_messages/simple_text.png)

### Text With Memory
To define a text message with memory, you need to **Set a Property** first and then use an expression response like this: 

     - {user.message} 

> [!NOTE] If you are not familar with setting a property in Composer, please refer to the [Memory in Bot Framework Composer](https://github.com/microsoft/BotFramework-Composer/blob/kaiqb/Ignite2019/docs/concept-memory-draft.md) article. If you are not familar with expression response format, please refer to the [Common Language Expression](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/common-expression-language#readme) article. 

Below is a screenshot of the text with memory example in the [Messages_Samples](https://github.com/microsoft/BotFramework-Composer/tree/master/SampleBots/Message_Samples/ComposerDialogs): 

![text_memory](./media/send_messages/text_memory.png)

### Text With LG
To define a text with LG, you need to define the LG template first and then reference it in inline LG editor using a square bracket “[]” to wrap the name of the LG template pre-defined. 

     # TextWithLG
    - Hi, this is a text with LG
    - Hey, this is a text with LG
    - Hello, this is a text with LG 

Below is a screenshot of the text with LG example in the [Messages_Samples](https://github.com/microsoft/BotFramework-Composer/tree/master/SampleBots/Message_Samples/ComposerDialogs): 

![text_LG](./media/send_messages/text_LG.png)

### LG With Parameter
To define LG with parameter, you need to include the parameter in the LG template. The template can then be referenced elsewhere. 

    # LGWithParam(user)
    - Hello {user.name}, nice to talk to you!

Below is a screenshot of the LG with paramter example in the [Messages_Samples](https://github.com/microsoft/BotFramework-Composer/tree/master/SampleBots/Message_Samples/ComposerDialogs): 

![LG_parameter](./media/send_messages/LG_parameter.png)

### LG Composition
LG composition mean to compose pre-defined LG templates. To define an LG Composition, you need to define the component template(s) first. Then you can use the pre-defined templates as building blocks to compose a new LG Template. 

    # Greeting
    - nice to talk to you!

    # LGComposition(user)
    - {user.name} [Greeting]

Below is a screenshot of the text with LG Composition in the [Messages_Samples](https://github.com/microsoft/BotFramework-Composer/tree/master/SampleBots/Message_Samples/ComposerDialogs): 

![LG_composition](./media/send_messages/LG_composition.png)


## References 
- [Send and Receive Text Message](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-send-messages?view=azure-bot-service-4.0)
- [Language Generation in Composer](https://github.com/microsoft/BotFramework-Composer/blob/kaiqb/Ignite2019/docs/concept-language-genereation-draft.md)
- [.lg file format](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md)
- [Common Language Expression](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/common-expression-language#readme)
- [Memory in Bot Framework Composer](https://github.com/microsoft/BotFramework-Composer/blob/kaiqb/Ignite2019/docs/concept-memory-draft.md)

## NEXT
TBD