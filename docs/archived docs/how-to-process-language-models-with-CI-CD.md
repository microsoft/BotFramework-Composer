# Using botframework-cli tool to process language models for Composer bots

Composer allows users to enable kinds of languages models such as [LUIS](https://www.luis.ai/home) and [QnAMaker](https://www.qnamaker.ai/). Composer can help to preprocess and publish these models to azure services if users provide the resource key and other essential elements. Fortunately, outside Composer, users can also use botframework-cli tool to achieve the same goal with below steps.
* [`cross-train`](#Cross-train-luis-and-qna-files)
* [`down-sampling`](#Down-sampling-on-luis-models)
* [`luis build`](#Luis-models-build)
* [`qnamaker build`](#Qnamaker-models-build)

## Prerequisites
[Botframework-cli](https://github.com/microsoft/botframework-cli/blob/main/README.md) tool is based on the Node.js platform and the [OClif](https://github.com/oclif/oclif) framework where it inherits its command line parsing style, and plugin architecture platform.

Install the tool using the following command:

~~~
$ npm i -g @microsoft/botframework-cli@next
$ bf plugins:install @microsoft/bf-sampler-cli@beta
~~~

Type `bf` to make sure the command is installed successfully.

You can find more details about [sampler](https://github.com/microsoft/botframework-cli/blob/beta/packages/sampler/README.md) cli plugin.

You also need to create [luis resources](https://docs.microsoft.com/en-us/azure/cognitive-services/luis/luis-how-to-azure-subscription#create-luis-resources-in-azure-portal) to get the luis authoringKey and [qnamaker resources](https://docs.microsoft.com/en-us/azure/cognitive-services/qnamaker/how-to/set-up-qnamaker-service-azure) to get the qnamaker subscriptionKey if you don't have.

## Process language models with cli tool
You can use the cli tool to process language models . A sample bot will be used to demonstrate how cli tool works with below steps.

### Create bot with luis and qna language models
Open Composer and choose to create a bot from template. Select the `Todo with LUIS` example bot. Go to bot root folder.

~~~
$ cd ToDoBotWithLuisSample-0
~~~

### Cross train luis and qna files
First create folder that holds cross-trained language model files and then use bf cli tool to cross train language models(LUIS and QnAMaker) files.

~~~
$ mkdir generated\interruption
$ bf luis:cross-train --in . --out generated\interruption --config settings\cross-train.config.json --force
~~~

You can find more details about [cross-train](https://github.com/microsoft/botframework-cli/tree/main/packages/luis#bf-luiscross-train) cli tool.

### Down sampling on luis models
Use bf cli tool to do down sampling on luis language model files and overwrite original ones. This step can be skipped if luis model files do not exist.

~~~
$ bf sampler:sampling --in generated\interruption --out generated\interruption --force
~~~

You can find more details about [sampling](https://github.com/microsoft/botframework-cli/blob/beta/packages/sampler/README.md#bf-samplersampling) cli tool.

### Luis models build
Use bf cli tool to build luis models and generate model setting if luis model files exist. Here YOUR_LUIS_AUTHORING_KEY can be got from your luis resources.

~~~
$ bf luis:build --in generated\interruption --authoringKey {YOUR_LUIS_AUTHORING_KEY} --botName {YOUR_BOT_NAME} --out generated --suffix composer --force --log
~~~

You can find more details about [luis:build](https://github.com/microsoft/botframework-cli/tree/main/packages/luis#bf-luisbuild) cli tool.

### Qnamaker models build
Use bf cli tool to build qnamaker models and generate model setting if qnamaker model files exist. Here YOUR_QNAMaker_SUBSCRIPTION_KEY can be got from your qnamaker resources.

~~~
$ bf qnamaker:build --in generated\interruption --subscriptionKey {YOUR_QNAMaker_SUBSCRIPTION_KEY} --botName {YOUR_BOT_NAME} --out generated --suffix composer --force --log
~~~

You can find more details about [qnamaker:build](https://github.com/microsoft/botframework-cli/tree/main/packages/qnamaker#bf-qnamakerbuild) cli tool.

### Test bot in emulator
After language models published and the setting files generated, you can use Emulator to test the bot by following below steps:
1. Configure appsettings.json
Go to settings folder and edit the appsettings.json.
- Fill the luis endpoint and endpointKey of prediction resource. You can find the endpoint and endpointKey after assigning the prediction resource to your models in [LUIS](https://www.luis.ai/home) portal. If there are no available prediction resources to assign, please create one in you luis resources. For more details about prediction resource, please find them [here](https://docs.microsoft.com/en-us/azure/cognitive-services/luis/luis-how-to-azure-subscription#assign-a-resource-to-an-app).
- Fill the qna endpointKey. You can find it on the console output of qnamaker build cmd or in the service settings page of [QnAMaker](https://www.qnamaker.ai/UserSettings) portal.

2. Copy and launch runtime
~~~
$ mkdir runtime
$ xcopy /S "{YOUR_DOTNET_RUNTIME_FOLDER}" "runtime" // you can get the runtime by ejecting it in composer or find it in your composer installation folder
$ cd runtime
$ dotnet run --project azurewebapp // launch runtime
~~~

3. Open Emulator and connect the bot with bot url set to http://localhost:3979/api/messages.
4. Communicate with the bot.