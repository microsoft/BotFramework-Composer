# Sending responses with cards
A bot communicates with users through message activities which are multi-modal. There are messages which simply consist of plain text and there are also richer message content such as cards. Bot Framework Composer supports [structured response template](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/structured-response-template.md) with which you can add rich cards to your bot and enhance your bot's design. If you are looking for examples about sending text messages to users please read the [sending messages to users](./how-to-send-messages.md) article.

In this article, we will cover different types of cards you can define in Composer using [structured response template](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/structured-response-template.md). We use the examples provided in the [RespondingWithCardsSample](https://github.com/microsoft/BotFramework-Composer/tree/main/Composer/packages/server/assets/projects/RespondingWithCardsSample) throughout this article.

## Card types
Composer currently supports the following types of rich cards. The definition and use of each type of the cards is provided in the [RespondingWithCardsSample](https://github.com/microsoft/BotFramework-Composer/tree/main/Composer/packages/server/assets/projects/RespondingWithCardsSample).

| Card type      | Description                                                                                                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Hero Card](how-to-send-cards.md#HeroCard) | A card that typically contains a single large image, one or more buttons, and simple text.                                                                            |
| [Thumbnail Card](how-to-send-cards.md#ThumbnailCard) | A card that typically contains a single thumbnail image, one or more buttons, and simple text.                                                                        |
| [Signin Card](how-to-send-cards.md#SigninCard)    | A card that enables a bot to request that a user sign-in. It typically contains text and one or more buttons that the user can click to initiate the sign-in process. |
| [Animation Card](how-to-send-cards.md#AnimationCard) | A card that can play animated GIFs or short videos.                                                                                                                   |
| [Video Card](how-to-send-cards.md#VideoCard)     | A card that can play a video file.                                                                                                                                    |
| [Audio Card](how-to-send-cards.md#AudioCard)     | A card that can play an audio file.                                                                                                                                   |
| [Adaptive Card](how-to-send-cards.md#AdaptiveCard)  | A customizable card that can contain any combination of text, speech, images, buttons, and input fields.                                                              |
| [All Card](how-to-send-cards.md#AllCards)  | To display all cards. |

## Structured response template
In Composer we use [structured response template](https://github.com/microsoft/BotBuilder-Samples/blob/vishwac/master-4.6/experimental/language-generation/docs/structured-response-template.md) to define the cards you want to send back to users. To get yourself familiar with the structured LG template, it is recommended that you read the [Language Generation](./concept-language-generation.md) concept article and the [structured response template](https://github.com/microsoft/BotBuilder-Samples/blob/vishwac/master-4.6/experimental/language-generation/docs/structured-response-template.md) article.

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
| image              | The url of your image.                                                |
| buttons            | Name of the button you want to show in the card.                      |

## Define rich cards
Now, let's walk through the card examples in the [RespondingWithCardsSample](https://github.com/microsoft/BotFramework-Composer/tree/main/Composer/packages/server/assets/projects/RespondingWithCardsSample) and learn how each type of the cards are defined and used.

### HeroCard
A Hero card is a basic card type that allows you to combine images, text and interactive elements such as buttons in one object and present a mixture of them to the user. A HeroCard is defined using structured template as follows:

    # HeroCard
    [HeroCard
      title = BotFramework Hero Card
      subtitle = Microsoft Bot Framework
      text = Build and connect intelligent bots to interact with your users naturally wherever they are, from text/sms to Skype, Slack,   Office 365 mail and other popular services.
      image = https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg
      buttons = @{cardActionTemplate('imBack', 'Show more cards', 'Show more cards')}
    ]

    # HeroCardWithMemory(name)
    [Herocard
      title=@{TitleText(name)}
      subtitle=@{SubText()}
      text=@{DescriptionText()}
      images=@{CardImages()}
      buttons=@{cardActionTemplate('imBack', 'Show more cards', 'Show more cards')}
    ]


This example of hero card will enable your bot to send an image from a designated url back to users when an event to send a hero card is triggered. The hero card will include a button to show more cards when pressed.

### ThumbnailCard
A Thumbnail card is another type of basic card type that combines a mixture of images, text and buttons. Unlike Hero cards which present designated images in a large banner, Thumbnail cards present images as thumbnail. It is card that typically contains a single thumbnail image, one or more buttons, and simple text. A ThumbnailCard is defined using structured template as follows:

    # ThumbnailCard
    [ThumbnailCard
        title = BotFramework Thumbnail Card
        subtitle = Microsoft Bot Framework
        text = Build and connect intelligent bots to interact with your users naturally wherever they are, from text/sms to Skype, Slack, Office 365 mail and other popular services.
        image = https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg
        buttons = Get Started]

### SigninCard
A Signin card is a card that enables a bot to request that a user sign in. A SinginCard is defined using structured template as follows:

    # SigninCard
    [SigninCard
       text = BotFramework Sign-in Card
       buttons = @{cardActionTemplate('signin', 'Sign-in', 'https://login.microsoftonline.com/')}
    ]

### AnimationCard
Animation cards contain animated image content (such as `.gif`). Typically this content does not contain sound, and is typically presented with minimal transport controls (e.g, pause/play) or no transport controls at all. Animation cards follow all shared rules defined for ort controls (e.g. rewind/restart/pause/play). Video cards follow all shared rules defined for [Media cards](https://github.com/microsoft/botframework-sdk/blob/master/specs/botframework-activity/botframework-cards.md#Media-cards). An AnimationCard is defined using structured template as follows:

    # AnimationCard
    [AnimationCard
        title = Microsoft Bot Framework
        subtitle = Animation Card
        image = https://docs.microsoft.com/en-us/bot-framework/media/how-it-works/architecture-resize.png
        media = http://i.giphy.com/Ki55RUbOV5njy.gif]

### VideoCard
Video cards contain video content in video format such as `.mp4`. Typically this content is presented to the user with advanced transport controls (e.g. rewind/restart/pause/play). Video cards follow all shared rules defined for [Media cards](https://github.com/microsoft/botframework-sdk/blob/master/specs/botframework-activity/botframework-cards.md#Media-cards). A VideoCard is defined using structured template as follows:

    # VideoCard
    [VideoCard
        title = Big Buck Bunny
        subtitle = by the Blender Institute
        text = Big Buck Bunny (code-named Peach) is a short computer-animated comedy film by the Blender Institute
        image = https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/220px-Big_buck_bunny_poster_big.jpg
        media = http://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4
        buttons = Learn More]

### AudioCard
Audio cards contain audio content in audio format such as `.mp3`  and `.wav`. Audio cards follow all shared rules defined for [Media cards](https://github.com/microsoft/botframework-sdk/blob/master/specs/botframework-activity/botframework-cards.md#Media-cards). An AudioCard is defined using structured template as follows:

    # AudioCard
    [AudioCard
        title = I am your father
        subtitle = Star Wars: Episode V - The Empire Strikes Back
        text = The Empire Strikes Back (also known as Star Wars: Episode V – The Empire Strikes Back)
        image = https://upload.wikimedia.org/wikipedia/en/3/3c/SW_-_Empire_Strikes_Back.jpg
        media = http://www.wavlist.com/movies/004/father.wav
        buttons = Read More]

### AdaptiveCard
Adaptive cards is an open source toolset of Microsoft that helps apps and services exchange rich snippets of native UI. Card authors describe their content as a simple JSON object. That content can then be rendered natively inside a host application, automatically adapting to the look and feel of the host. To get an overview of adaptive cards please visit [here](https://docs.microsoft.com/en-us/adaptive-cards/). An AdaptiveCard is defined using structured template as follows:

    # AdaptiveCard
    [Activity
      Attachments = @{json(adaptivecardjson())}
    ]

### AllCards
This template "#AllCards" is defined to display all cards when the template is called.

    # AllCards
    [Activity
         Attachments = @{HeroCard()} | @{ThumbnailCard()} | @{SigninCard()} | @{AnimationCard()} | @{VideoCard()} | @{AudioCard()} | @{AdaptiveCard()}
         AttachmentLayout = @{AttachmentLayoutType()}
    ]

## References
- [Bot Framework - Cards](https://github.com/microsoft/botframework-sdk/blob/master/specs/botframework-activity/botframework-cards.md)
- [Add media to messages](https://docs.microsoft.com/azure/bot-service/bot-builder-howto-add-media-attachments)
- [Language Generation](./concept-language-generation.md)
- [Structured response template](https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/language-generation/docs/structured-response-template.md)
- [Adaptive Cards overview](https://docs.microsoft.com/adaptive-cards/)
- [Adaptive Cards Sample](https://github.com/microsoft/BotBuilder-Samples/tree/master/samples/csharp_dotnetcore/07.using-adaptive-cards)
- [Adaptive Cards for bot developers](https://docs.microsoft.com/adaptive-cards/getting-started/bots)

## Next
- Learn [how to define triggers and events](./how-to-define-triggers.md).

