# How to use OAuth in Bot Framework Composer

If your bot needs to access external resources using permissions granted by the end user, it will need to use the `OAuth Login` action within the `Access external resources` menu, along with a an OAuth configuration that lives in the Azure Bot Service Channels Registration. In this article, you will cover how to use basic OAuth to authenticate your bot with your GitHub account. (It is not necessary to deploy your bot to Azure for this to work.)

![oauth-menu](./media/integration/oauth-menu.png)

## Prerequisites: 
- [Microsoft Azure subscription](https://azure.microsoft.com)
- [a basic bot you build using Composer](tutorial-create-echobot.md)
- a service provider your bot is authenticating with such as [GitHub](https://github.com/)
- basic knowledge of [Bot Channels Registration](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-quickstart-registration?view=azure-bot-service-3.0) and how to create one
- basic knowledge of [user authentication within a conversation](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-concept-authentication?view=azure-bot-service-4.0)


## Create the Azure Bot Service registration

If you've already got an Azure Bot Service channel registration, you can skip to the [next step](#configure-the-oauth-connection-settings-in-azure)

If you don't, follow [these instructions to create a registration in the Azure portal](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-quickstart-registration?view=azure-bot-service-3.0).

Make sure you note the `app ID` and `app password` that is generated during this process. You'll need it in this [step](#configure-the-oauth-connection-settings-in-composer).

## Configure the OAuth Connection Settings in Azure

From the bot channel registration inside Azure, click the "Settings" tab on the left.  At the bottom of the resulting pane, you'll see a section titled "OAuth Connection Settings".  Click "Add Setting".

![screenshot: oauth setting in Azure portal](Assets/oauth-azure-settings.png)

This will open a new settings pane, where you can configure the OAuth connection.  Depending on the service you are authenticating with, the options will differ. Pictured below is the settings pane for configuring a login to Github:

![screenshot: configure an oauth setting in azure](Assets/oauth-github.png)

Note the `Name` of your connection - you will need to enter this value in Composer exactly as it is displayed in this setting.

You should fill in the values of `Client ID`, `Client Secret`, and optionally `Scopes` depending on the service you are authenticating with. In this example of GitHub, follow the steps to get these values: 

- Go to [GitHub developer's setting webpage](https://github.com/settings/developers) and click `New OAuth App` on the right upper corner. This will redirect you to the GitHub OAuth App registration website. Fill in the values as instructed in the following: 

  `Application name`: a name you would like to give to your OAuth application, e.g. `Composer`
   
   `Homepage URL`: the full URL to your application homepage, e.g. `http://microsoft.com`
   
   `Authorization callback URL`: the callback URL of your application, e.g. `https://token.botframework.com/.auth/web/redirect`. read more [here](https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/). 
 
- Click `Register application`. Then you will see the `Client ID`, `Client Secret` values generated in the application webpage as the following: 

![oauth-app-credentials](./media/integration/oauth-app-credentials.png)

- Copy the `Client ID` and `Client Secret` values and paste them to your Azure's Service Provider Connection Setting. These values configure the connection between your Azure resource and GitHub. Optionally, you can fill `user, repo, admin` in `Scopes`. This field specifies the permission you want to grant to the caller. Save this setting.  

Now, with the  `Name` , `Client ID`, `Client Secret`, and `Scopes` of your new OAuth connection setting in Azure, you are ready to configure your bot.

## Configure the OAuth Connection Settings in Composer

First, click on the settings tab in Composer, and add update the `Dialog settings` with the `app ID` and `app password` values from Azure. You'll put these into the `MicrosoftAppId` and `MicrosoftAppPassword` keys in the settings, as shown below:

![composer-oauth-setting](./media/integration/composer-oauth-setting.png)

Then, add the `OAuth Login` action to your dialog.  In the properties panel view of that step, set the `Connection Name` to the name of your connection setting in Azure. This value must match exactly.

You will also need to configure at least the `Text` and `Title` values, which configure the message that will be displayed alongside the login button, as well as the `property` field, which will bind the results of the OAuth action to a variable in your bot's memory.

![oauth-login-properties](./media/integration/oauth-login-properties.png)

Your bot is now configured to use this OAuth connection!

## Use the OAuth results in your bot

When you launch the bot in the Emulator and trigger the appropriate dialog, the bot will present a login card. Clicking the button in the card will launch the OAuth process in a new window.

![screenshot: oauth card in emulator](Assets/oauth-card.png)

You'll be asked to login to whatever external resource you've specified. Once complete, the window will close automatically, and your bot will continue with the dialog.

The results of the OAuth action will now be stored into the property you specified. To reference the user's OAuth token, use `<scope.name>.token` -- so for example, if the OAuth prompt is bound to `dialog.oauth`, the token will be `dialog.oauth.token`.

To use this to access the protected resources, pass the token into any API calls you make with the `HTTP Request` action. You can refer to the token value in URL, body or headers of the HTTP request using the normal LG syntax, for example: `{dialog.oauth.token}`.


## Further Reading

* [User authentication within a conversation](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-concept-authentication?view=azure-bot-service-4.0)

## Next

* Learn how to [send an HTTP request and use OAuth](how-to-send-http-request.md). 
