# Sending messages to users
The primary way a bot communicates with users is through message activites. Some messages may simply consist of plain text, while others may contain richer content such as cards or attachments. In this article, we will cover the different types of text messages you can use in Bot Framework Composer and how to use them. We use examples in the [responding with text](https://github.com/microsoft/BotFramework-Composer/tree/master/Composer/packages/server/assets/projects/RespondingWithTextSample) sample throughout this article. If you are looking for examples about sending responses with cards please read the [sending cards to users](./howto-sending-cards.md) article. 

## User scenario
When your bot receives messages from the user, any **intents** and **entity** values in the message are extracted and passed on to the dialog's event handler. In the event handler you can define actions the bot should take to respond to the users. Sending messages back to the user is one type of action you can define in the event handler. 

Below is a screenshot of the **Send a response** action in Composer. How to get there: 

1. Click the " + " sign under the trigger 
2. Select **Send a response**

![send_response](./media/send_messages/send_response.png)

> [!NOTE] All types of triggers have the **Send a response** action component. The **Handle ConversationUpdate** trigger is one type of trigger used here for demo purposes. 

## What to know
In Composer, all messages that are sent back to the user are composed in the language generation (LG) editor and follow the [.lg file format](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md). If you are not familiar with language generation in Composer, please read the [language generation](./concept-language-genereation-draft.md) concept article. 

The table below lists five different types of text messages provided in Composer and their respective descriptions. 

| Message Type     | Description                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------------- |
| Simple text      | A simple LG defined to generate a single line text response. |
| Text with memory | An LG template with pre-set property to generate a text response.    |
| Text with LG     | A reference to a pre-defined LG template to generate a text response. |
| LG with parameter | An LG template with pre-set property as parameter to generate a text response. |
| LG composition    | An LG template composed with other pre-defined templates to generate a text response. |

## Define different text messages
To send a message, you need to specify **Send an Activity** and then in the the language generation inline editor you can author your response message in [.lg format](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md). 

### Simple text
To define a simple text message, use a "-" before the text that your want your bot to respond to users. 

     - Here is a simple text message. 

Below is a screenshot of the simple text message example in [responding with text](https://github.com/microsoft/BotFramework-Composer/tree/master/Composer/packages/server/assets/projects/RespondingWithTextSample) sample: 

![simple_text](./media/send_messages/simple_text.png)

### Text with memory
To define a text message with memory, you need to **Set a Property** first and then use an expression response like this: 

     - {user.message} 

> [!NOTE] If you are not familar with setting a property in Composer, please refer to the [conversation flow and memory](./concept-memory.md) article. If you are not familar with expression response format, please refer to the [common language expression](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/common-expression-language#readme) article. 

Below is a screenshot of the text with memory example in [responding with text](https://github.com/microsoft/BotFramework-Composer/tree/master/Composer/packages/server/assets/projects/RespondingWithTextSample) sample: 

![text_memory](./media/send_messages/text_memory.png)

### Text with LG
Text with LG means a reference to a pre-defined LG template to generate a text response. It is achieved by markdown link notation by enclosing the target template name in square brackets - [TemplateName]. For example, you can define an LG templates named **TextWithLG** and reference this template as needed. 

     # TextWithLG
    - Hi, this is a text with LG
    - Hey, this is a text with LG
    - Hello, this is a text with LG 

Below is a screenshot that shows the reference of the pre-defined template named **TextWithLG** in the [responding with text](https://github.com/microsoft/BotFramework-Composer/tree/master/Composer/packages/server/assets/projects/RespondingWithTextSample) sample: 

![text_LG](./media/send_messages/text_LG.png)

### LG with parameter
LG with parameter means an LG template with pre-set property as parameter to generate a text response. To define LG with parameter, you need to include the parameter in the LG template. The template can then be referenced elsewhere. 

    # LGWithParam(user)
    - Hello {user.name}, nice to talk to you!

Below is a screenshot of the LG with parameter example in the the [responding with text](https://github.com/microsoft/BotFramework-Composer/tree/master/Composer/packages/server/assets/projects/RespondingWithTextSample) sample: 

![LG_parameter](./media/send_messages/LG_parameter.png)

### Language generation composition
LG composition means to compose new LG template using pre-defined LG templates. To define an LG Composition you need to define the component template(s) first and then use the pre-defined templates as building blocks to compose a new LG Template. For example, you can define a **Greeting** LG template and then compose a new template named **LGComposition(user)** using the **Greeting** template. 

    # Greeting
    - nice to talk to you!

    # LGComposition(user)
    - {user.name} [Greeting]

Below is a screenshot of the text with LG Composition in the [responding with text](https://github.com/microsoft/BotFramework-Composer/tree/master/Composer/packages/server/assets/projects/RespondingWithTextSample) sample: 

![LG_composition](./media/send_messages/LG_composition.png)


## References 
- [Send and receive text message](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-send-messages?view=azure-bot-service-4.0)
- [Language generation](./concept-language-genereation.md)
- [.lg file format](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md)
- [Common language expression](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/common-expression-language#readme)

## NEXT
Learn how to [ask for user input](./howto-ask-for-user-input.md).
