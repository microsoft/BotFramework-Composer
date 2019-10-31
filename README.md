# ![Microsoft Bot Framework Composer](./docs/Assets/gh-banner.png)

# Microsoft Bot Framework Composer [PREVIEW]

[![Build Status](https://fuselabs.visualstudio.com/Composer/_apis/build/status/ComposerCI/Composer-CI?branchName=master)](https://fuselabs.visualstudio.com/Composer/_build/latest?definitionId=516&branchName=master)

## Overview 
 
Bot Framework Composer is an integrated development tool for developers and multi-disciplinary teams to build bots and conversational experiences with the Microsoft Bot Framework. Within this tool, you'll find everything you need to build a sophisticated conversational experience. 
- A visual editing canvas for conversation flows
- In context editing for language understanding (NLU) 
- Tools to train, test and manage language understanding (NLU) and QnA components
- Language generation and templating system
- A ready-to-use bot runtime executable

The Bot Framework Composer is an open source tool based on the Bot Framework SDK.  

<p align="center">
    <img alt="Bot Framework Composer Home Page" src="./docs/Assets/Screenshot-Composer-overview.png" style="max-width:700px;" />
</p>


## Who should use this PREVIEW release?
-	This preview is for developers looking to build conversation applications using the latest Bot Framework SDK preview features like Adaptive Dialogs, Language Understanding and Language Generation. 
-	Composer and the Bot Framework Adaptive Dialog are in-preview and should not be used for production deployments. 
-	We designed Composer to be a web app to allow developers to extend Composer as well as embed it within their own solutions. The
 current version of Composer is a web app that runs locally. Future releases will enable Composer to run as a centralized hosted web application. 


## Get Started

- To get your-self familiar with the Composer, read [Introduction to Bot Framework Composer][1].
- [Deploy Bot Framework Composer][2] on your local machine and [create your first bot][3].
- [Learn how to use Composer to build bots][4].

To build and run the Composer project locally. From the Composer folder, run the following commands
```
$ cd Composer // switch to Composer folder
$ yarn install // install dependencies
$ yarn build // build extensions and libs
$ yarn startall // start client and server at the same time
```

## Support and Feedback
- [As a question on stack overflow][10]
- [Request few feature][11]
- [File an issue][12]

## Related project
The Bot Framework Composer is part of the [Bot Framework][20] platform:
-	[Bot Framework SDK][21]
-	[Bot Framework Emulator][22]


## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct][100].
For more information see the [Code of Conduct FAQ][101] or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Reporting Security Issues

Security issues and bugs should be reported privately, via email, to the Microsoft Security
Response Center (MSRC) at [secure@microsoft.com](mailto:secure@microsoft.com). You should
receive a response within 24 hours. If for some reason you do not, please follow up via
email to ensure we received your original message. Further information, including the
[MSRC PGP][102] key, can be found in
the [Security TechCenter][103].


[1]:./docs/bfcomposer-intro.md
[2]:./docs/setup-yarn.md
[3]:./docs/tutorial-create-echobot.md
[4]:https://aka.ms/BF-Composer-Docs

[10]:https://stackoverflow.com/questions/tagged/botframework?tab=Newest
[11]:https://github.com/microsoft/BotFramework-Composer/issues/new?assignees=&labels=Type%3A+suggestion%2C+Needs-triage&template=bot-framework-composer-feature-request.md&title=
[12]:https://github.com/microsoft/BotFramework-Composer/issues/new?assignees=&labels=Needs-triage%2C+Type%3A+bug&template=bot-framework-composer-bug.md&title=

[20]:https://github.com/microsoft/botframework#microsoft-bot-framework
[21]:https://github.com/microsoft/botframework-sdk#bot-framework-sdk
[22]:https://github.com/Microsoft/BotFramework-Emulator#readme

[100]:https://opensource.microsoft.com/codeofconduct/
[101]:https://opensource.microsoft.com/codeofconduct/faq/

[102]:https://technet.microsoft.com/en-us/security/dn606155
[103]:(https://technet.microsoft.com/en-us/security/default)