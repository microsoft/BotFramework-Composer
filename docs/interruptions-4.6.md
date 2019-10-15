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

```C#
var rootDialog = new AdaptiveDialog(nameof(AdaptiveDialog))
{
    Generator = new TemplateEngineLanguageGenerator(),
    Recognizer = new RegexRecognizer() {
        Intents = new List<IntentPattern>() {
            new IntentPattern() {
                Intent = "GetUserProfile",
                Pattern = "(?i)hi"
            }
        }
    },
    Triggers = new List<OnCondition>()
    {
        new OnConversationUpdateActivity()
        {
            Actions = WelcomeUserAction()
        },
        new OnIntent() {
            Intent = "GetUserProfile",
            Actions = new List<Dialog>() {
                new TextInput() {
                    Prompt = new ActivityTemplate("Hello, I'm the demo bot. What is your name?"),
                    Property = "$userName"
                },
                new SendActivity() {
                    Activity = new ActivityTemplate("Hello, I have your name as '{$userName}'")
                },
                new NumberInput() {
                    Prompt = new ActivityTemplate("What is your age?"),
                    Property = "$userAge"
                },
                new SendActivity() {
                    Activity = new ActivityTemplate("Thank you. I have your age as '{$userAge}'")
                }
            }
        }
    }
};
```

## 2. Multi-turn with validations

Here's the next level of sophistication where the bot can set **validation constraints** on user input and re-prompt in a more elegant way.

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

```C#
var rootDialog = new AdaptiveDialog(nameof(AdaptiveDialog))
{
    Generator = new TemplateEngineLanguageGenerator(),
    Recognizer = new RegexRecognizer() {
        Intents = new List<IntentPattern>() {
            new IntentPattern() {
                Intent = "GetUserProfile",
                Pattern = "(?i)hi"
            }
        }
    },
    Triggers = new List<OnCondition>()
    {
        new OnConversationUpdateActivity()
        {
            Actions = WelcomeUserAction()
        },
        new OnIntent() {
            Intent = "GetUserProfile",
            Actions = new List<Dialog>() {
                new TextInput() {
                    Prompt = new ActivityTemplate("Hello, I'm the demo bot. What is your name?"),
                    Validations = new List<string>() {
                        "count(this.value) >= 2",
                        "count(this.value) <= 150"
                    },
                    InvalidPrompt = new ActivityTemplate("Sorry, '{this.value}' does not work. I'm looking for 2-150 characters. What is your name?"),
                    Property = "$userName"
                },
                new SendActivity() {
                    Activity = new ActivityTemplate("Hello, I have your name as '{$userName}'")
                },
                new NumberInput() {
                    Prompt = new ActivityTemplate("What is your age?"),
                    Validations = new List<string>() {
                        "int(this.value) >= 1",
                        "int(this.value) <= 100"
                    },
                    InvalidPrompt = new ActivityTemplate("Sorry, '{this.value}' does not work. I'm looking for 1-150. What is your age?"),
                    Property = "$userAge"
                },
                new SendActivity() {
                    Activity = new ActivityTemplate("Thank you. I have your age as '{$userAge}'")
                }
            }
        }
    }
};
```

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

```C#
var rootDialog = new AdaptiveDialog(nameof(AdaptiveDialog))
{
    Generator = new TemplateEngineLanguageGenerator(),
    Recognizer = new RegexRecognizer() {
        Intents = new List<IntentPattern>() {
            new IntentPattern() {
                Intent = "GetUserProfile",
                Pattern = "(?i)hi"
            }
        }
    },
    Triggers = new List<OnCondition>()
    {
        new OnConversationUpdateActivity()
        {
            Actions = WelcomeUserAction()
        },
        new OnIntent() {
            Intent = "GetUserProfile",
            Actions = new List<Dialog>() {
                new TextInput() {
                    Prompt = new ActivityTemplate("Hello, I'm the demo bot. What is your name?"),
                    Validations = new List<string>() {
                        "count(this.value) >= 2",
                        "count(this.value) <= 150"
                    },
                    InvalidPrompt = new ActivityTemplate("Sorry, '{this.value}' does not work. I'm looking for 2-150 characters. What is your name?"),
                    Property = "$userName"
                },
                new SendActivity() {
                    Activity = new ActivityTemplate("Hello, I have your name as '{$userName}'")
                },
                new NumberInput() {
                    Prompt = new ActivityTemplate("What is your age?"),
                    Validations = new List<string>() {
                        "int(this.value) >= 1",
                        "int(this.value) <= 100"
                    },
                    InvalidPrompt = new ActivityTemplate("Sorry, '{this.value}' does not work. I'm looking for 1-150. What is your age?"),
                    Property = "$userAge",
                    UnrecognizedPrompt = new ActivityTemplate("Sorry, I do not recognize '{this.value}'. What is your age?")
                },
                new SendActivity() {
                    Activity = new ActivityTemplate("Thank you. I have your age as '{$userAge}'")
                }
            }
        }
    }
};
```
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

> **FIXED** [SDK-feature-gap] This experience needs an SDK change to introduce a `onMaxTurn` message to the user that communicates that the bot has set a default value. Solution would be to introduce a `MaxCountResponse` that is issued when max count is hit.

<a id="s-g-2"></a>

> **FIXED** [SDK-feature-gap] Need a streamlined way to access an action's properties. E.g. I should be able to say something like `Sorry, I'm not getting it. For now, I'll set your age to {~defaultValue}`. Where `~defaultValue` maps to `dialog.instance.defaultValue`. 

> **FIXED** [SDK-bug] MaxTurnCount does not work correctly with consultation. https://github.com/microsoft/botbuilder-dotnet/issues/2392

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

```C#
var rootDialog = new AdaptiveDialog(nameof(AdaptiveDialog))
{
    Generator = new TemplateEngineLanguageGenerator(),
    Recognizer = new RegexRecognizer() {
        Intents = new List<IntentPattern>() {
            new IntentPattern() {
                Intent = "GetUserProfile",
                Pattern = "(?i)hi"
            }
        }
    },
    Triggers = new List<OnCondition>()
    {
        new OnConversationUpdateActivity()
        {
            Actions = WelcomeUserAction()
        },
        new OnIntent() {
            Intent = "GetUserProfile",
            Actions = new List<Dialog>() {
                new TextInput() {
                    Prompt = new ActivityTemplate("Hello, I'm the demo bot. What is your name?"),
                    Validations = new List<string>() {
                        "count(this.value) >= 2",
                        "count(this.value) <= 150"
                    },
                    InvalidPrompt = new ActivityTemplate("Sorry, '{this.value}' does not work. I'm looking for 2-150 characters. What is your name?"),
                    Property = "$userName",
                    MaxTurnCount = 3,
                    DefaultValue = "'Human'",
                    DefaultValueResponse = new ActivityTemplate("Sorry, I'm not getting it. For now, I'll set your name to '{%DefaultValue}'.")
                },
                new SendActivity() {
                    Activity = new ActivityTemplate("Hello, I have your name as '{$userName}'")
                },
                new NumberInput() {
                    Prompt = new ActivityTemplate("What is your age?"),
                    Validations = new List<string>() {
                        "int(this.value) >= 1",
                        "int(this.value) <= 100"
                    },
                    InvalidPrompt = new ActivityTemplate("Sorry, '{this.value}' does not work. I'm looking for 1-150. What is your age?"),
                    Property = "$userAge",
                    UnrecognizedPrompt = new ActivityTemplate("Sorry, I do not recognize '{this.value}'. What is your age?"),
                    MaxTurnCount = 3,
                    DefaultValue = "30",
                    DefaultValueResponse = new ActivityTemplate("Sorry, I'm not getting it. For now, I'll set your age to '{%DefaultValue}'.")
                },
                new SendActivity() {
                    Activity = new ActivityTemplate("Thank you. I have your age as '{$userAge}'")
                }
            }
        }
    }
};
```
## 5. Using LUIS for entity extraction

User can answer requested information as a sentence. 

Note: You need something more flexible like LUIS beyond this point. 

> **FIXED** [SDK-bug] Multiple inputs with validation do not work well with consultation. Work around is to add non input actions between inputs. 

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

```markdown
> .lu content for this scenario
> !# @app.name = get user profile
> !# @app.culture = en-us
> !# @app.desc = get user profile application used to demonstrate power of adaptive dialogs

# GetUserProfile
- hi
- hello
- start

> This intent will capture utterances user can say when responding to inputs
# GetProfileInputs
- my name is {@userName}
- {@userName}
- {@userAge}
- I'm {@userAge} years old
- ([(i'm|my name is)] {@userName}|[and] [i'm] {@userAge} [years old])

@ prebuilt personName userName
@ prebuilt age userAge
```

```C#
var rootDialog = new AdaptiveDialog(nameof(AdaptiveDialog))
{
    Generator = new TemplateEngineLanguageGenerator(),
    Recognizer = new LuisRecognizer(GetLUISApp()),
    Triggers = new List<OnCondition>()
    {
        new OnConversationUpdateActivity()
        {
            Actions = WelcomeUserAction()
        },
        new OnIntent() {
            Intent = "GetUserProfile",
            Actions = new List<Dialog>() {
                new TextInput() {
                    Prompt = new ActivityTemplate("Hello, I'm the demo bot. What is your name?"),
                    Validations = new List<string>() {
                        "count(this.value) >= 2",
                        "count(this.value) <= 150"
                    },
                    InvalidPrompt = new ActivityTemplate("Sorry, '{this.value}' does not work. I'm looking for 2-150 characters. What is your name?"),
                    Property = "$userName",
                    MaxTurnCount = 3,
                    DefaultValue = "'Human'",
                    DefaultValueResponse = new ActivityTemplate("Sorry, I'm not getting it. For now, I'll set your name to '{%DefaultValue}'."),
                    Value = "@userName"
                },
                new SendActivity() {
                    Activity = new ActivityTemplate("Hello, I have your name as '{$userName}'")
                },
                new NumberInput() {
                    Prompt = new ActivityTemplate("What is your age?"),
                    Validations = new List<string>() {
                        "int(this.value) >= 1",
                        "int(this.value) <= 100"
                    },
                    InvalidPrompt = new ActivityTemplate("Sorry, '{this.value}' does not work. I'm looking for 1-150. What is your age?"),
                    Property = "$userAge",
                    UnrecognizedPrompt = new ActivityTemplate("Sorry, I do not recognize '{this.value}'. What is your age?"),
                    MaxTurnCount = 3,
                    DefaultValue = "30",
                    DefaultValueResponse = new ActivityTemplate("Sorry, I'm not getting it. For now, I'll set your age to '{%DefaultValue}'."),
                    Value = "@userAge"
                },
                new SendActivity() {
                    Activity = new ActivityTemplate("Thank you. I have your age as '{$userAge}'")
                }
            }
        }
    }
};
```
## 5a. Multi-entity extraction

User can specify multiple pieces of information in one go

| Who?  | Message                                                                   |
|------:|:--------------------------------------------------------------------------|
|User:  | Hi                                                                        |   
|Bot:   | Hello, I'm the demo bot. What is your name?                               |
|User:  | vishwac and i'm 36 years old                                              |
|Bot:   | Hello vishwac, nice to meet you. I have your age as 36                    |

(same as #5)

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

(same as #5)

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

Same .lu content as #5
```C#
// Notice how the various `AllowInterrupsions` properties are configured.
var rootDialog = new AdaptiveDialog(nameof(AdaptiveDialog))
{
    Generator = new TemplateEngineLanguageGenerator(),
    Recognizer = new LuisRecognizer(GetLUISApp()),
    Triggers = new List<OnCondition>()
    {
        new OnConversationUpdateActivity()
        {
            Actions = WelcomeUserAction()
        },
        new OnIntent() {
            Intent = "GetUserProfile",
            Actions = new List<Dialog>() {
                new TextInput() {
                    Prompt = new ActivityTemplate("Hello, I'm the demo bot. What is your name?"),
                    Validations = new List<string>() {
                        "count(this.value) >= 2",
                        "count(this.value) <= 150"
                    },
                    InvalidPrompt = new ActivityTemplate("Sorry, '{this.value}' does not work. I'm looking for 2-150 characters. What is your name?"),
                    Property = "$userName",
                    MaxTurnCount = 3,
                    DefaultValue = "'Human'",
                    DefaultValueResponse = new ActivityTemplate("Sorry, I'm not getting it. For now, I'll set your name to '{%DefaultValue}'."),
                    Value = "@userName",
                    AllowInterruptions = "!#GetUserProfile"
                },
                new SendActivity() {
                    Activity = new ActivityTemplate("Hello, I have your name as '{$userName}'")
                },
                new NumberInput() {
                    Prompt = new ActivityTemplate("What is your age?"),
                    Validations = new List<string>() {
                        "int(this.value) >= 1",
                        "int(this.value) <= 100"
                    },
                    InvalidPrompt = new ActivityTemplate("Sorry, '{this.value}' does not work. I'm looking for 1-150. What is your age?"),
                    Property = "$userAge",
                    UnrecognizedPrompt = new ActivityTemplate("Sorry, I do not recognize '{this.value}'. What is your age?"),
                    MaxTurnCount = 3,
                    DefaultValue = "30",
                    DefaultValueResponse = new ActivityTemplate("Sorry, I'm not getting it. For now, I'll set your age to '{%DefaultValue}'."),
                    Value = "@userAge",
                    AllowInterruptions = "!#GetUserProfile"
                },
                new ConfirmInput() {
                    Property = "$confirm",
                    Prompt = new ActivityTemplate("I have '{$userName}' as your name and '{$userAge}' as your age. Is this correct?"),
                    MaxTurnCount = 3,
                    DefaultValue = "false",
                    DefaultValueResponse = new ActivityTemplate("Sorry, I do not understand that. For now, let's assume you do not wish to confirm."),
                    AllowInterruptions = "false"
                },
                new IfCondition() {
                    Condition = "$confirm",
                    Actions = new List<Dialog> () {
                        new SendActivity() {
                           Activity = new ActivityTemplate("Thank you. I have your age as '{$userAge}'")
                        }
                    },
                    ElseActions = new List<Dialog> () {
                        new SendActivity() {
                            Activity = new ActivityTemplate("Sure. Let's start over.")
                        },
                        new DeleteProperty() {
                            Property = "$userName"
                        },
                        new DeleteProperty() {
                            Property = "$userAge"
                        },
                        new RepeatDialog()
                    }
                }
                
            }
        }
    }
};
```
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

> **FIXED** [bug] set property in consultation does not work to move the input forward (confirm input) -- needs investigation

```markdown
> .lu content for this scenario
> !# @app.name = get user profile
> !# @app.culture = en-us
> !# @app.desc = get user profile application used to demonstrate power of adaptive dialogs

# GetUserProfile
- hi
- hello
- start

# Why
- Why do you ask?
- Why do you need my name?
- Why?
- Why do you need my age?

# NoValue
- No name
- No age
- I will not give you my name
- I will not give you my age
- I'm not comfortable giving you my name
- Not confortable with sharing that
- No way
- Sorry, not giving you that information

> This intent will capture utterances user can say when responding to inputs
# GetProfileInputs
- my name is {@userName}
- {@userName}
- {@userAge}
- I'm {@userAge} years old

@ prebuilt personName userName
@ prebuilt age userAge
```

```C# 
var rootDialog = new AdaptiveDialog(nameof(AdaptiveDialog))
{
    Generator = new TemplateEngineLanguageGenerator(),
    Recognizer = new LuisRecognizer(GetLUISApp()),
    Triggers = new List<OnCondition>()
    {
        new OnConversationUpdateActivity()
        {
            Actions = WelcomeUserAction()
        },
        new OnIntent() {
            Intent = "Why",
            Actions = new List<Dialog>() {
                // Its better to off load this logic to LG via a conditional response genration template.
                new IfCondition() {
                    Condition = "$userName == null",
                    Actions = new List<Dialog>() {
                        new SendActivity() {
                            Activity = new ActivityTemplate("I need your name to address you correctly.")
                        }
                    },
                    ElseActions = new List<Dialog>() {
                        new SendActivity() {
                            Activity = new ActivityTemplate("I need your age to provide relevant product recommendations.")
                        }
                    }
                }
            }
        },
        new OnIntent() {
            Intent = "NoValue",
            Actions = new List<Dialog>() {
                new IfCondition() {
                    Condition = "$userName == null",
                    Actions = new List<Dialog>() {
                        new SetProperty() {
                            Property = "$userName",
                            Value = "'Human'"
                        },
                        new SendActivity() {
                            Activity = new ActivityTemplate("No worries. I'll set your name to '{$userName}' for now.")
                        }
                    },
                    ElseActions = new List<Dialog>() {
                        new SetProperty() {
                            Property = "$userAge",
                            Value = "30"
                        },
                        new SendActivity() {
                            Activity = new ActivityTemplate("No problem. I'll set your age to '{$userAge}' for now.")
                        }
                    }
                }
            }
        },
        new OnIntent() {
            Intent = "GetUserProfile",
            Actions = new List<Dialog>() {
                new TextInput() {
                    Prompt = new ActivityTemplate("Hello, I'm the demo bot. What is your name?"),
                    Validations = new List<string>() {
                        "count(this.value) >= 2",
                        "count(this.value) <= 150"
                    },
                    InvalidPrompt = new ActivityTemplate("Sorry, '{this.value}' does not work. I'm looking for 2-150 characters. What is your name?"),
                    Property = "$userName",
                    MaxTurnCount = 3,
                    DefaultValue = "'Human'",
                    DefaultValueResponse = new ActivityTemplate("Sorry, I'm not getting it. For now, I'll set your name to '{%DefaultValue}'."),
                    Value = "@userName",
                    AllowInterruptions = "!#GetUserProfile"
                },
                new SendActivity() {
                    Activity = new ActivityTemplate("Hello, I have your name as '{$userName}'")
                },
                new NumberInput() {
                    Prompt = new ActivityTemplate("What is your age?"),
                    Validations = new List<string>() {
                        "int(this.value) >= 1",
                        "int(this.value) <= 100"
                    },
                    InvalidPrompt = new ActivityTemplate("Sorry, '{this.value}' does not work. I'm looking for 1-150. What is your age?"),
                    Property = "$userAge",
                    UnrecognizedPrompt = new ActivityTemplate("Sorry, I do not recognize '{this.value}'. What is your age?"),
                    MaxTurnCount = 3,
                    DefaultValue = "30",
                    DefaultValueResponse = new ActivityTemplate("Sorry, I'm not getting it. For now, I'll set your age to '{%DefaultValue}'."),
                    Value = "@userAge",
                    AllowInterruptions = "!#GetUserProfile"
                },
                new ConfirmInput() {
                    Property = "$confirm",
                    Prompt = new ActivityTemplate("I have '{$userName}' as your name and '{$userAge}' as your age. Is this correct?"),
                    MaxTurnCount = 3,
                    DefaultValue = "false",
                    DefaultValueResponse = new ActivityTemplate("Sorry, I do not understand that. For now, let's assume you do not wish to confirm."),
                    AllowInterruptions = "false"
                },
                new IfCondition() {
                    Condition = "$confirm",
                    Actions = new List<Dialog> () {
                        new SendActivity() {
                           Activity = new ActivityTemplate("Thank you. I have your age as '{$userAge}'")
                        }
                    },
                    ElseActions = new List<Dialog> () {
                        new SendActivity() {
                            Activity = new ActivityTemplate("Sure. Let's start over.")
                        },
                        new DeleteProperty() {
                            Property = "$userName"
                        },
                        new DeleteProperty() {
                            Property = "$userAge"
                        },
                        new RepeatDialog()
                    }
                }
            }
        }
    }
};
```
