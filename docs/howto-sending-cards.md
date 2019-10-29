# Sending cards 

A bot communicates with users through message activites which are multi-modal. There are messages which simply consist of plain text and there are also richer message content such as cards. Bot Framework Composer supports [structured response template](https://github.com/microsoft/BotBuilder-Samples/blob/vishwac/master-4.6/experimental/language-generation/docs/structured-response-template.md) with which you can add rich cards to your bot and enhance yor bot's design. 

In this article, we will cover different types of cards you can define in Composer using [structured response template](https://github.com/microsoft/BotBuilder-Samples/blob/vishwac/master-4.6/experimental/language-generation/docs/structured-response-template.md). We use the examples provided in the [Cards_Samples](https://github.com/microsoft/BotFramework-Composer/tree/stable/SampleBots/Cards_Samples) throughout this article.

## Card basics

### Card types 

The Bot Framework currently supports the following types of rich cards. The definition and use of each type of the cards is provided in the [Cards_Samples](https://github.com/microsoft/BotFramework-Composer/tree/stable/SampleBots/Cards_Samples). 

| Card type      | Description                                                                                                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero Card      | A card that typically contains a single large image, one or more buttons, and text.                                                                                   |
| Thumbnail Card | A card that typically contains a single thumbnail image, one or more buttons, and text.                                                                               |
| Signin Card    | A card that enables a bot to request that a user sign-in. It typically contains text and one or more buttons that the user can click to initiate the sign-in process. |
| Animation Card | A card that can play animated GIFs or short videos.                                                                                                                   |
| Voice Card     | A card that can play a voice file.                                                                                                                                    |
| Audio Card     | A card that can play an audio file.                                                                                                                                   |
| Adaptive Card  | A customizable card that can contain any combination of text, speech, images, buttons, and input fields.                                                              |

When processing events within rich cards, the _card action_ objects are used to specify what should happen when the user clicks a button or taps a section of the card. Each card action has a _type_ and _value_. To function correctly, an action type is assigned to each clickable item on the card. See details [here](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-add-media-attachments?view=azure-bot-service-4.0&tabs=csharp). 

## Structured response template 

In Bot Framework Composer we use [structured response template](https://github.com/microsoft/BotBuilder-Samples/blob/vishwac/master-4.6/experimental/language-generation/docs/structured-response-template.md) to define the cards you want to send back to users. To get yourself familiar with the structured LG template, it is recommended that you read the [language generation](https://github.com/microsoft/BotFramework-Composer/blob/kaiqb/Ignite2019/docs/concept-language-genereation-draft.md) concept article. 

A typical structured response template for cards consists of the following parts: 

    # CardTemplateName 
    [CardStructure-name
        title = title of the card
        subtitle = subtitle of the card
        text = description of the card
        image = url of your image
        buttons = name of the button you want to show in the card]

| Template Component | Description                                                           |
| ------------------ | --------------------------------------------------------------------- |
| # CardTemplateName | Name of the structured card template starting with "#".               |
| [   ]              | A pair of square brackets to wrap the content of the structure.       |
| CardStructure-name | Name of the structure.                                                |
| title              | A title of the defined template such as "BotFramework Hero Card".     |
| subtitle           | A subtitle of the defined template such as "Microsoft Bot Framework". |
| text               | A brief description of the template.                                  |
| image              | The directory of your image.                                          |
| buttons            | Name of the button you want to show in the card.                      |

## Define rich cards 
Now, let's walk through the card examples in the [Cards_Samples](https://github.com/microsoft/BotFramework-Composer/tree/stable/SampleBots/Cards_Samples) and learn how each type of the cards are defined and used. 

### HeroCard
A hero card is one type of card that allows you to combine images and buttons in one object and send them to the user. The definition of a hero card in Composer in structured LG template looks like the following: 

    # HeroCard
    [HeroCard
        title = BotFramework Hero Card
        subtitle = Microsoft Bot Framework
        text = Build and connect intelligent bots to interact with your users naturally wherever they are, from text/sms to Skype, Slack, Office 365 mail and other popular services.
        image = https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg
        buttons = {cardActionTemplate('imBack', 'Show more cards', 'Show more cards')}]

This example of hero card will enable your bot to send an image from a designated url back to users when an event to send a hero card is triggered. The hero card will include a button to show more cards when pressed. 

### ThumbnailCard

    # ThumbnailCard
    [ThumbnailCard
        title = BotFramework Thumbnail Card
        subtitle = Microsoft Bot Framework
        text = Build and connect intelligent bots to interact with your users naturally wherever they are, from text/sms to Skype, Slack, Office 365 mail and other popular services.
        image = https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg
        buttons = Get Started]

### SigninCard

    # SigninCard
    [SigninCard
        text = BotFramework Sign-in Card
        buttons = Sign-in]

### AnimationCard

    # AnimationCard
    [AnimationCard
        title = Microsoft Bot Framework
        subtitle = Animation Card
        image = https://docs.microsoft.com/en-us/bot-framework/media/how-it-works/architecture-resize.png
        media = http://i.giphy.com/Ki55RUbOV5njy.gif]

### VoiceCard

    # VideoCard
    [VideoCard
        title = Big Buck Bunny
        subtitle = by the Blender Institute
        text = Big Buck Bunny (code-named Peach) is a short computer-animated comedy film by the Blender Institute
        image = https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/220px-Big_buck_bunny_poster_big.jpg
        media = http://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4
        buttons = Learn More]

### AudioCard

    # AudioCard
    [AudioCard
        title = I am your father
        subtitle = Star Wars: Episode V - The Empire Strikes Back
        text = The Empire Strikes Back (also known as Star Wars: Episode V – The Empire Strikes Back)
        image = https://upload.wikimedia.org/wikipedia/en/3/3c/SW_-_Empire_Strikes_Back.jpg
        media = http://www.wavlist.com/movies/004/father.wav
        buttons = Read More]

### AdaptiveCard
Adaptive cards is an open source toolset of Microsoft that helps apps and services exchage rich snippets of native UI. Card authors describe their content as a simple JSON object. That content can then be rendered natively inside a host application, automatically adapting to the look and feel of the host. For example, Contoso Bot can author an Adaptive Card through the Bot Framework, and when delivered to Cortana, it will look and feel like a Cortana card. When that same payload is sent to Microsoft Teams, it will look and feel like Microsoft Teams. As more host apps start to support Adaptive Cards, that same payload will automatically light up inside these applications, yet still feel entirely native to the app. Users win because everything feels familiar. Host apps win because they control the user experience. Card authors win because their content gets broader reach without any additional work. To learn more about adaptive cards please visit [here](https://adaptivecards.io/).

    # AdaptiveCard
    [Activity
        Attachments = {json(adaptivecardjson())}
    ]

### AllCards 
This template "#AllCards" is defined to display all cards when called. 

    # AllCards
    [Activity
        Attachments = {HeroCard()} | {ThumbnailCard()} | {SigninCard()} | {AnimationCard()} | {VideoCard()} | {AudioCard()} | {AdaptiveCard()}
        AttachmentLayout = {AttachmentLayoutType()}
    ]


## References
- [Add media to messages](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-howto-add-media-attachments?view=azure-bot-service-4.0&tabs=csharp)
- [Language generation](https://github.com/microsoft/BotFramework-Composer/blob/kaiqb/Ignite2019/docs/concept-language-genereation-draft.md) 
- [Structured response template](https://github.com/microsoft/BotBuilder-Samples/blob/vishwac/master-4.6/experimental/language-generation/docs/structured-response-template.md)
- [Add rich card attachments to messages](https://docs.microsoft.com/en-us/azure/bot-service/nodejs/bot-builder-nodejs-send-rich-cards?view=azure-bot-service-3.0&viewFallbackFrom=azure-bot-service-4.0#send-an-adaptive-card)
- [Adaptive cards](https://adaptivecards.io/)
- [Using adaptive cards](https://github.com/microsoft/BotBuilder-Samples/tree/master/samples/csharp_dotnetcore/07.using-adaptive-cards)
- [Adaptive cards for bot developers](https://docs.microsoft.com/en-us/adaptive-cards/getting-started/bots)

## Next
TBD 

