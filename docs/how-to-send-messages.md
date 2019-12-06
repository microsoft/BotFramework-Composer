# Sending messages to users
The primary way a bot communicates with users is through message activities. Some messages may simply consist of plain text, while others may contain richer content such as cards or attachments. In this article, we will cover the different types of text messages you can use in Bot Framework Composer and how to use them. We use examples in the [RespondingWithTextSample](https://github.com/microsoft/BotFramework-Composer/tree/master/Composer/packages/server/assets/projects/RespondingWithTextSample) throughout this article. If you are looking for examples about sending responses with cards please read the [RespondingWithCardsSample](./how-to-send-cards.md) article. 

## User scenario
When your bot receives messages from the user, any **intents** and **entity** values in the message are extracted and passed on to the dialog's event handler (trigger). In the trigger you can define actions the bot should take to respond to the users. Sending messages back to the user is one type of action you can define in the trigger. 

Below is a screenshot of the **Send a response** action in Composer. How to get there: 

1. Click the " + " sign under the trigger 
2. Select **Send a response**

![send_response](./media/send_messages/send_response.png)


## What to know
In Composer, all messages that are sent back to the user are composed in the Language Generation (LG) editor and follow the [.lg file format](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md). If you are not familiar with language generation in Composer, please read the [language generation](./concept-language-generation.md) article. 

The table below lists the different types of text messages provided in Composer and their respective descriptions. 

| Message Type      | Description                                                                           |
| ----------------- | ------------------------------------------------------------------------------------- |
| Simple text       | A simple LG defined to generate a single line text response.                          |
| Text with memory  | An LG template with pre-set property to generate a text response.                     |
| Text with LG      | A reference to a pre-defined LG template to generate a text response.                 |
| LG with parameter | An LG template with pre-set property as parameter to generate a text response.        |
| LG composition    | An LG template composed with other pre-defined templates to generate a text response. |

## Define different text messages
To send a message, you need to specify **Send a response** action and then in the the Language Generation editor author your response message in [.lg format](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md). You can also define an lg template in **Bot Responses** (the lg all-up view) and reference the template in lg inline editor using the syntax `@{templateName()}`. 

### Simple text
To define a simple text message, use a "-" before the text that you want your bot to respond to users. 

     - Here is a simple text message. 
     
You can also define a simple text message with multiple variations. Bot will respond with any of the simple text messages by random. For example: 

     > Greeting template with 2 variations. 
     # GreetingPrefix
     - Hi
     - Hello

### Text with memory
To define a text message with memory, you need to **Set a Property** first and then use an expression response like this: 

     - @{user.message} 

> [!NOTE] If you are not familiar with setting a property in Composer, please refer to the [conversation flow and memory](./concept-memory.md) article. If you are not familiar with expression response format, please refer to the [common language expression](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/common-expression-language#readme) article. 

### LG with parameter
LG with parameter means an LG template with pre-set property as parameter to generate a text response. To define LG with parameter, you need to include the parameter in the LG template. For example: 

    # LGWithParam(user)
    - Hello @{user.name}, nice to talk to you!

In this LG template, `user` is included as a parameter in the parentheses `()`of the template. The value of user's name is made available via `@{user.name}`. 

### LG composition
LG composition means to compose new LG template using pre-defined LG templates. To define an LG Composition you need to define the component template(s) first and then use the pre-defined templates as building blocks to compose a new LG template. For example: 

    # Greeting
    - nice to talk to you!

    # LGComposition(user)
    - @{user.name} @{Greeting()}

In this template `# LGComposition(user)`, a pre-defined template `# Greeting` is used to compose the new template. The syntax to include a pre-defined template is `@{templateName()}`. 

### Strcutured LG
Structured LG uses [structured response template](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/structured-response-template.md) format to compose LG templates. For example: 

    # StructuredText
    [Activity
       Text = text from structured
    ]    

This is a simple structured LG with output response `text from structured`. The definition of a structured template is as follows: 
    
    # TemplateName
    > this is a comment
    [Structure-name
        Property1 = <plain text> .or. <plain text with template reference> .or. <expression> 
        Property2 = list of values are denoted via '|'. e.g. a | b
    > this is a comment about this specific property
        Property3 = Nested structures are achieved through composition
    ]

### Multiline text 
Each one-of variation can include multi-line text enclosed in ```...```. 

    # multilineText
    - ``` you have such alarms
          alarm1:  7:am
          alarm2: 9:pm
     ```

Multi-line variation can request template expansion and entity substitution by enclosing the requested operation in `@{}`. With multi-line support, you can have the language generation sub-system fully resolve a complex JSON or XML (e.g. SSML wrapped text to control bot's spoken reply). 

### If/Else condition


### Switch condition 


## References 
- [Send and receive text message](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-send-messages?view=azure-bot-service-4.0)
- [Language Generation](./concept-language-generation.md)
- [.lg file format](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/lg-file-format.md)
- [Common language expression](https://github.com/microsoft/BotBuilder-Samples/tree/master/experimental/common-expression-language#readme)

## NEXT
Learn how to [ask for user input](./howto-ask-for-user-input.md).
