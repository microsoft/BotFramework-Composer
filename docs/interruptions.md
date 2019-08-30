# Scenarios for conversation modelling
This is a living document that lists possilbe conversation modelling scenarios as they relate to consultation/ interruption handling. 

## 1.  Basic multi-turn conversation

Basic scenario of multi-input form flow. Here the user answers the questions directly in all cases.

| Who?  | Message                                                   |
|------:|:----------------------------------------------------------|
|User:  | Hi                                                        |
|Bot:   | Hello, I'm the demo bot. What is your name?               |
|User:  | vishwac                                                   |
|Bot:   | Hello, I have your name as 'vishwac'                      |
|Bot:   | What is your age?                                         |
|User:  | I'm 36                                                    |
|Bot:   | Thank you. I have your age as 36                          |    

## 2. Multi-turn with validations

Here's the next level of sophistication where the bot can set **validation constraints** on user input and re-prompt in a more elegant way

<a id="c-g-1"></a>

> [Composer-gap] We need to provide guidance for users to use turn.value. When adding constraints, the placeholder text could include a simple expression with turn.value to guide users. 

| Who?  | Message                                                                           |
|------:|:----------------------------------------------------------------------------------|
|User:  | Hi                                                                                |
|Bot:   | Hello, I'm the demo bot. What is your name?                                       |
|User:  | v                                                                                 |
|Bot:   | Sorry, 'v' does not work. Give me something between 2-150 characters in length    |
|User:  | vishwac                                                                           |
|Bot:   | Hello, I have your name as 'vishwac'                                              |
|Bot:   | What is your age?                                                                 |
|User:  | 350                                                                               |
|Bot:   | Sorry, 350 does not work. Give me something between 1-150                         |
|User:  | Ok, 36                                                                            |
|Bot:   | Thank you. I have your age as 36                                                  |    

## 3. Unrecognized re-prompt

Next up, the bot can understand that the user is not answering the question using the **input's internal entity recognizer** (for non TextInput cases) and can come back with a re-prompt that is approrpiate for this scenario. 

| Who?  | Message                                                                   |
|------:|:--------------------------------------------------------------------------|
|User:  | Hi                                                                        |   
|Bot:   | Hello, I'm the demo bot. What is your name?                               |
|User:  | vishwac                                                                   |
|Bot:   | Hello, I have your name as 'vishwac'                                      |
|Bot:   | What is your age?                                                         |
|User:  | can you sing a song?                                                      |
|Bot:   | Sorry, I do not understand that. I'm looking for a number between 1-150   |
|User:  | Ok, 36                                                                    |
|Bot:   | Thank you. I have your age as 36                                          |    

## 4. Max retry based multi-turn

Bot might decide to set a limit on how many times it reprompts for a piece of information 

**Current experience**

| Who?  | Message                                                                   |
|------:|:--------------------------------------------------------------------------|
|User:  | Hi                                                                        |   
|Bot:   | Hello, I'm the demo bot. What is your name?                               |
|User:  | vishwac                                                                   |
|Bot:   | Hello, I have your name as 'vishwac'                                      |
|Bot:   | What is your age?                                                         |
|User:  | can you sing a song?                                                      |
|Bot:   | Sorry, I do not understand that. I'm looking for a number between 1-150   |
|User:  | tell me a joke                                                            |
|Bot:   | Sorry, I do not understand that. I'm looking for a number between 1-150   |
|User:  | blah blah blah                                                            |
|Bot:   | Thank you. I have your age as 36                                          |

In the above example, the bot took '36' as user's age assuming that was set as the `DefaultValue` property for the NumberInput that prompted user for their age. However user has no clue that this happened. 

**Better expereince**

<a id="s-g-1"></a>

> [SDK-feature-gap] This experience needs an SDK change to introduce a `onMaxTurn` message to the user that communicates that the bot has set a default value. Solution would be to introduce a `MaxCountResponse` that is issued when max count is hit.

<a id="s-g-2"></a>

> [SDK-feature-gap] Need a streamlined way to access an action's properties. E.g. I should be able to say something like `Sorry, I'm not getting it. For now, I'll set your age to {~defaultValue}`. Where `~defaultValue` maps to `dialog.instance.defaultValue`. 

> [SDK-bug] MaxTurnCount does not work correctly with consultation. https://github.com/microsoft/botbuilder-dotnet/issues/2392

| Who?  | Message                                                                   |
|------:|:--------------------------------------------------------------------------|
|User:  | Hi                                                                        |   
|Bot:   | Hello, I'm the demo bot. What is your name?                               |
|User:  | vishwac                                                                   |
|Bot:   | Hello, I have your name as 'vishwac'                                      |
|Bot:   | What is your age?                                                         |
|User:  | can you sing a song?                                                      |
|Bot:   | Sorry, I do not understand that. I'm looking for a number between 1-150   |
|User:  | tell me a joke                                                            |
|Bot:   | Sorry, I do not understand that. I'm looking for a number between 1-150   |
|User:  | blah blah blah                                                            |
|Bot:   | **Sorry, I'm not getting it. For now, I'll set your age to 30. You can say 'My age is \<your age>' to give me that information**   |
|Bot:   | Thank you. I have your age as 30                                          |


## 5. Using LUIS for entity extraction

User can answer requested information as a sentence. 

Note: You need something more flexible like LUIS beyond this point. 

> [SDK-bug] Multiple inputs with validation do not work well with consultation. Work around is to add non input actions between inputs. 

> https://github.com/microsoft/botbuilder-dotnet/issues/2390

> https://github.com/microsoft/botbuilder-dotnet/issues/2391

**Bad experience**

| Who?  | Message                                                                   |
|------:|:--------------------------------------------------------------------------|
|User:  | Hi                                                                        |   
|Bot:   | Hello, I'm the demo bot. What is your name?                               |
|User:  | its vishwac                                                               |
|Bot:   | Hello, I have your name as '**its vishwac**'                              |
|Bot:   | What is your age?                                                         |
|...    | ...                                                                       |

**Acceptable experience**

| Who?  | Message                                                                   |
|------:|:--------------------------------------------------------------------------|
|User:  | Hi                                                                        |   
|Bot:   | Hello, I'm the demo bot. What is your name?                               |
|User:  | its vishwac                                                               |
|Bot:   | Hello, I have your name as '**vishwac**'                                  |
|Bot:   | What is your age?                                                         |
|...    | ...                                                                       |


## 5a. Multi-entity extraction

User can specify multiple pieces of information in one go

| Who?  | Message                                                                   |
|------:|:--------------------------------------------------------------------------|
|User:  | Hi                                                                        |   
|Bot:   | Hello, I'm the demo bot. What is your name?                               |
|User:  | vishwac and i'm 36 years old                                              |
|Bot:   | Hello vishwac, nice to meet you. I have your age as 36                    |

## 5b. Out of order entity extraction

<a id="s-g-3"></a>

> [SDK-feature-gap]: With this, user still needs to answer the current question being asked if using text input. Event with no actions is not working at the moment. Bug? A better solution would be to have a processInput action that can be set to `true` to indicate the active input should re-process user input or `false` to indicate that the active input should re-prompt. 

> Note: With this, the user is still in control of out-of order entity correction. E.g. user could say `my name is vishwac and not 36` as an example. Being able to understand propositional phrases like `and, or, not` etc are not pre-baked constructs in LUIS or our dialog system. The user will need to manually design for, configure and handle these. 

| Who?  | Message                                                                   |
|------:|:--------------------------------------------------------------------------|
|User:  | Hi                                                                        |   
|Bot:   | Hello, I'm the demo bot. What is your name?                               |
|User:  | i'm 36 years old                                                          |
|Bot:   | Hello 'I'm 36 years old', nice to meet you. I have your age as 36         |

## 6. Disambiguation

Bot might choose to disambiguate on user's response

<a id="s-g-4"></a>

> [SDK-feature-gap] No built-in constructs available for disambiguation. User is in control of detecting and managing this experience. FormInput action is the solution.

## 7. Confirmation

Bot might choose to confirm user input before proceeding

### 7.a Basic confirmation

Yes path. 

| Who?  | Message                                                   |
|------:|:----------------------------------------------------------|
|User:  | Hi                                                        |
|Bot:   | Hello, I'm the demo bot. What is your name?               |
|User:  | vishwac                                                   |
|Bot:   | Hello, I have your name as 'vishwac'                      |
|Bot:   | What is your age?                                         |
|User:  | I'm 36                                                    |
|Bot:   | I have your name as 'vishwac' and age '36'. Is that right?|
|User:  | Yes                                                       |
|Bot:   | Thank you. You are all set.                               |    

No path. 

| Who?  | Message                                                   |
|------:|:----------------------------------------------------------|
|User:  | Hi                                                        |
|Bot:   | Hello, I'm the demo bot. What is your name?               |
|User:  | vishwac                                                   |
|Bot:   | Hello, I have your name as 'vishwac'                      |
|Bot:   | What is your age?                                         |
|User:  | I'm 36                                                    |
|Bot:   | I have your name as 'vishwac' and age '36'. Is that right?|
|User:  | No                                                        |
|Bot:   | Ok. let's start over                                      |

### 7.b Confirmation flow with change handling

<a id="s-g-5"></a>

> [SDK-feature-gap]
No built-in constructs available for change handling. User is in control of detecting and managing this experience. FormInput action is the solution.

| Who?  | Message                                                   |
|------:|:----------------------------------------------------------|
|User:  | Hi                                                        |
|Bot:   | Hello, I'm the demo bot. What is your name?               |
|User:  | vishwac                                                   |
|Bot:   | Hello, I have your name as 'vishwac'                      |
|Bot:   | What is your age?                                         |
|User:  | I'm 36                                                    |
|Bot:   | I have your name as 'vishwac' and age '36'. Is that right?|
|User:  | No                                                        |
|Bot:   | No worries. What would you like to change?                |    
|User:  | My age is 42                                              |
|Bot:   | I have your name as 'vishwac' and age '42'. Is that right?|
|User:  | Yes                                                       |
|Bot:   | Thank you. You are all set.                               |   

### 7.c. Confirmation with inline change mangement

| Who?  | Message                                                   |
|------:|:----------------------------------------------------------|
|User:  | Hi                                                        |
|Bot:   | Hello, I'm the demo bot. What is your name?               |
|User:  | vishwac                                                   |
|Bot:   | Hello, I have your name as 'vishwac'                      |
|Bot:   | What is your age?                                         |
|User:  | I'm 36                                                    |
|Bot:   | I have your name as 'vishwac' and age '36'. Is that right?|
|User:  | No, I'm 42                                                |
|Bot:   | I have your name as 'vishwac' and age '42'. Is that right?|
|User:  | Yes                                                       |
|Bot:   | Thank you. You are all set.                               |   

## 8. Local intents

Next up, the user can ask clarifying questions (help or locally relevant intents) while the bot is executing a multi-turn conversation with the user. 

At this point, it is better to get set up with one dialog per scenario.

**Bad expereince:**

| Who?  | Message                                               |
|------:|:------------------------------------------------------|
|User:  | Hi                                                    |
|Bot:   | Hello, I'm the demo bot. What is your name?           |
|User:  | why do you need my name?                              |
|Bot:   | Hello, I have your name as 'why do you need my name?' |
|Bot:   | What is your age?                                     |
|User:  | No. My name is Vishwac                                |
|Bot:   | What is your age?                                     |
|User:  | Cancel/ I give up                                     |    

**Acceptable experience**

| Who?  | Message                                               |
|------:|:------------------------------------------------------|
|User:  | Hi                                                    |
|Bot:   | Hello, I'm the demo bot. What is your name?           |
|User:  | why do you need my name?                              |
|Bot:   | I need your name to be able to address you correctly  |
|Bot:   | What is your name?                                    |
|User:  | I'm vishwac                                           |
|Bot:   | Hello Vishwac, what is your age?                      |
|User:  | I will not give you my age.                           |    
|Bot:   | No worries. For now, I will set your age to 30.       |

<a id="c-b-1"></a>

> [bug] set property in consultation does not work to move the input forward (confirm input) -- needs investigation


## 9. Interruption

The user could have expressed intent to intiate a conversation about a completely different topic. There are different ways the bot could decide to handle this interruption - 

1. Do the interruption and resume current conversation
2. Continue current conversation and queue up the interruption to be performed after the current conversation completes
3. Ignore the interruption and continue current conversation
4. Abandon the current conversation and switch to the interruption.

> [Add] Named resumption - `Let's go back to booking a flight`

Default behavior is #1 above but the other options are configurable via EditSteps action.  

| Who?  | Message                                               |
|------:|:------------------------------------------------------|
|User:  | Hi                                                    |
|Bot:   | Hello, I'm the demo bot. What is your name?           |
|User:  | tell me a joke                                        |
|Bot:   | Here's something funny ... ''' ...                    |
|Bot:   | What is your name?                                    |
|...    | ...                                                   |

Here's an example conversation that shows the interruption being queued up after the current conversation is complete.

| Who?  | Message                                                                   |
|------:|:--------------------------------------------------------------------------|
|User:  | Hi                                                                        |
|Bot:   | Hello, I'm the demo bot. What is your name?                               |
|User:  | tell me a joke                                                            |
|Bot:   | Sure, I can tell you a joke right after we are done with your profile.    |
|Bot:   | What is your name?                                                        |
|...    | ...                                                                       |
|Bot:   | Here's the joke you asked for                                             |
|Bot:   | ... ''' ...                                                               |

<a id="s-g-11"></a>

> [SDK-feature-gap] Painful to have an intent event that shorts consultation - this is the intent(s) that detect entities for turn.n conversations. 

<a id="s-g-12"></a>

> [SDK-feature-gap] We should auto-save recognized entities but need to account for doing it only on known intents - e.g. we do not want to over-write entities detected with `interruption` intent since that might not be applicable/ relevant

<a id="s-g-13"></a>

> [SDK-feature-gap] Is it the right behavior to start an instance of a dialog everytime? E.g. with consultation, if the root dialog's recognizer fires the active child's intent, we will start another instance of the child instead of resuming the instance of that child that's already in the stack.

<a id="s-g-6"></a>

> [SDK-feature-gap] Our current EditSteps action does not model well since it is unclear if all recognized intent actions need to be wrapped in EditSteps (due to consultation bubbling)

<a id="s-g-7"></a>

> [SDK-feature-gap] Our current solution also does not provide a way for the consultation bubble on who is being interrupted so the parent can decide how to handle the interruption itself. 

<a id="c-g-2"></a>

> [Composer-gap] Composer does not include a visual canvas to author EditSteps action.


## 10. Interruption with confirmation, resumption

Bot could chooce to confirm with the user before deciding an action plan for handling interruption

<a id="s-g-8"></a>

> [SDK-feature-gap] This scenario is not possible today. Ideally, user should get a continue processing consultation action that they can add to the canvas when the user confirms interruption. 

**User confirms interruption**

| Who?  | Message                                                                   |
|------:|:--------------------------------------------------------------------------|
|User:  | Hi                                                                        |
|Bot:   | Hello, I'm the demo bot. What is your name?                               |
|User:  | reset profile                                                             |
|Bot:   | Would you like to reset your profile? This will wipe out any information I have about you and end our current conversation    |
|User:  | yes                                                                       |
|Bot:   | Sure, I have reset your profile.                                          |

**User rejects interruption confirmation**

| Who?  | Message                                                                   |
|------:|:--------------------------------------------------------------------------|
|User:  | Hi                                                                        |
|Bot:   | Hello, I'm the demo bot. What is your name?                               |
|User:  | reset profile                                                             |
|Bot:   | Would you like to reset your profile? This will wipe out any information I have about you and end our current conversation    |
|User:  | no                                                                        |
|Bot:   | No worries. Let's continue..                                              |
|Bot:   | What is your name?                                                        |
|...    | ...                                                                       |

## 11. Context carry over multi-turn

Bot could choose to carry context forward across interrupting conversations

<a id="s-g-9"></a>

> [SDK-feature-gap] This is hard to achieve without data-model driven dialogs since there is no sense today for a dialog to describe what it can accept/ return.

| Who?  | Message                                                                           |
|------:|:----------------------------------------------------------------------------------|
|User:  | Book flight                                                                       |
|Bot:   | Sure. What is your destination city?                                              |
|User:  | How's the weather in seattle next thursday?                                       |
|Bot:   | It is forecast to be 72' and sunny in seattle next thursday                       |
|Bot:   | Are you looking to fly to Seattle next thursday?                                  |
|User:  | Yes                                                                               |
|Bot:   | Got it. I have flights to seattle for next thursday. What is your departure city? |
|...    | ...                                                                               |

## 12. QnA

Bot could choose to look up a knowledge base to come back with an answer. 

> [Composer] It is unclear if we want to teach users to think about intent .vs. QA as separate concepts. If so, how do we educate users to model `why do you need my name` as a QA pair or as intent + action? My 2c is for us to continue to blur this line for the user and have the system do the right thing while providing an affordance for the user to define simple QA pairs that are contextually relevant. 

| Who?  | Message                                       |
|------:|:----------------------------------------------|
|User:  | hi                                            |
|Bot:   | hello, I'm the demo bot. What is your name?   |
|User:  | well, what is your name?                      |
|Bot:   | Its 'demo bot'                                |
|Bot:   | What is your name?                            |
|...    | ...                                           |

This bucket also includes open ended questions like these - 

- factual: `who is the president of USA?`
- statements: `You are awesome!`
- chitchat: `can you sing a song?`

## 12.a QnA + follow up

User could ask clarifying questions as a multi-turn QA conversation

| Who?  | Message                                       |
|------:|:----------------------------------------------|
|User:  | hi                                            |
|Bot:   | hello, I'm the demo bot. What is your name?   |
|User:  | well, what is your name?                      |
|Bot:   | Its 'demo bot'                                |
|Bot:   | What is your name?                            |
|User:  | and who made you?                             |
|Bot:   | I was built by engieers at contoso cafe       |
|Bot:   | What is your name?                            |
|User:  | how old are you?                              |
|Bot:   | Concept of age does not apply to me.          |
|Bot:   | What is your name?                            |
|.....  | ......                                        |

# Feature gaps
## SDK
1. [ ] [Add MaxCountResponse](#s-g-1) add a new property that carries the response the bot will send if max turn count is hit and a default value will be picked up by the input. Tracked via this bug - https://github.com/microsoft/botbuilder-dotnet/issues/2422
2. [ ] [Ability to access instance properties](#s-g-2) `~maxTurnCount` should resolve to `dialog.instance.maxTurnCount`. There is no way to access an action's properties through LG/ memory path. Tracked via - https://github.com/microsoft/botbuilder-dotnet/issues/2423
3. [ ] [ProcessInput action](#s-g-3) Ability for users to indicate if user input is consumed or should be reprocessed. Tracked via this bug - https://github.com/microsoft/botbuilder-dotnet/issues/2425
4. [X] [Disambiguation](#s-g-4) Provide built in support for disambiguation via data model definition & FormInput action
5. [X] [Change handling](#s-g-5) Provide built in support for change handling for entities via data model definition & FormInput action
6. [EditSteps-guidance](#s-g-6) Its unclear how to use EditSteps effectively with consultation as well as for the default triggering
7. [X] [Consultation-active-dialog-info](#s-g-7) Consultation does not include any information about the active dialog/ active adaptive dialog to use in decision making (with EditSteps). Guide user to set a flag to provide this info.
8. [Consultation-confirmation](#s-g-8) It is not possible to manually control consultation bubbling today.
9. [X] [Data-model-definition](#s-g-9) Unable to achieve context carry over type conversations without clear data model that describes what each dialog accepts/ returns.
10. [ ] [QnA-integration](#s-g-10) No QnA integartion. Tracked via this bug - https://github.com/microsoft/botbuilder-dotnet/issues/1919
11. [ ] [Revisit-intent-event-for-consultation](#s-g-11) Painful to have an intent that shorts consultation. Tracked via this bug - https://github.com/microsoft/botbuilder-dotnet/issues/2426
12. [ ] [Auto-save-recognized-entities](#s-g-12) We should auto-save recognized entities but need to account for doing it only on known intents - e.g. we do not want to over-write entities detected with `interruption` intent since that might not be applicable/ relevant. Tracked via https://github.com/microsoft/botbuilder-dotnet/issues/2427
13. [X] [BeginDialog-single-active-instance](#s-g-13) Is it the right behavior to start an instance of a dialog everytime? May be we add a configuration at the dialog level that says if a new instance (necessary for re-usable child dialogs) should be fired or use active instance if found in the stack (default behavior)

## Composer
1. [ ] [turn.value guidance](#c-g-1) provide guidance for users to use turn.value. Tracked via https://github.com/microsoft/BotFramework-Composer/issues/708
2. [ ] [EditSteps](#c-g-2) Composer does not include a visual authoring experience for EditSteps action. Tracked via https://github.com/microsoft/BotFramework-Composer/issues/654

# Bugs
## SDK
1. [bug][s-b-1] Max turn conunt does not work with consultation. 
2. [bug][s-b-2] Multiple inputs with validation do not work well with consultation. 
3. [bug][s-b-3] Inputs with validation do not work well with consultation. 

## Composer
1. [bug](#c-b-1) Confirm input does not work with consultation. Needs investigation.

[s-b-1]:https://github.com/microsoft/botbuilder-dotnet/issues/2392
[s-b-2]:https://github.com/microsoft/botbuilder-dotnet/issues/2390
[s-b-3]:https://github.com/microsoft/botbuilder-dotnet/issues/2391
[s-g-10]:https://github.com/microsoft/botbuilder-dotnet/issues/1919