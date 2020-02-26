// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';

import { LuEditor } from '../../src';

const content = `> ## Intent definition
# Greeting
- hi
- hello

> ## Machine learned entity
@ ml name firstName, lastName
# getUserName
- my name is {username=vishwac}

> Without an explicit entity definition, 'userName' defaults to 'ml' entity type.

> ## Prebuilt entity
@ prebuilt number numOfGuests
@ prebuilt datetimeV2 fromDate, toDate
@ prebuilt age userAge

> ## List entity
@ list color favColor, screenColor
@ color =
    - red
        - deep red
        - light red
 
> Alternate definition

@ list color2 favColor2, screenColor2 =
    - red
        - deep red
        - light red

> ## Composite entity        
@ composite deviceTemperature from, to
@ deviceTemperature =
    - child1, child2

> Alternate definition

@ composite deviceTemperature from, to = [child1, child2] 
# setThermostat
> This utterance labels ‘thermostat to 72’ as composite entity deviceTemperature
    - Please set {deviceTemperature = thermostat to 72}
> This is an example utterance that labels ‘owen’ as customDevice (ml entity) and wraps ‘owen to 72’ with the ‘deviceTemperature’ composite entity
    - Set {deviceTemperature = {customDevice = owen} to 72}

> Define a composite entity ‘deviceTemperature’ that has device (list entity), customDevice (ml entity), temperature (pre-built entity) as children

@ composite deviceTemperature = [device, customDevice, temperature]

@ list device = 
	- thermostat :
		- Thermostat
		- Heater
		- AC
		- Air conditioner
	- refrigterator : 
		- Fridge
    	- Cooler

@ ml customDevice

@ prebuilt temperature

> ## Regex entity
@ regex hrf-number from, to
@ hrf-number = /hrf-[0-9]{6}/

> Alternate definition

@ regex hrf-number from, to = /hrf-[0-9]{6}/

> ## Roles
> # ml entity definition with roles

@ ml name role1, role2

> this is the same as 

@ ml name hasRoles role1, role2

> this is also the same as 

@ ml name
@ name hasRoles role1, role2

> Also same as 

@ ml name
@ name hasRole role1
@ name hasRole role2

# AskForUserName
- {userName:firstName=vishwac} {userName:lastName=kannan}
- I'm {userName:firstName=vishwac}
- my first name is {userName:firstName=vishwac}
- {userName=vishwac} is my name

> This definition is same as including an explicit defintion for userName with 'lastName', 'firstName' as roles

> @ ml userName hasRoles lastName, firstName

> In patterns, you can use roles using the {<entityName>:<roleName>} notation. Here's an example:
# getUserName
- call me {name:userName}
- I'm {name:userName}
- my name is {name:userName}

> roles can be specified for list entity types as well - in this case fromCity and toCity are added as roles to the 'city' list entity defined further below

# BookFlight
- book flight from {city:fromCity} to {city:toCity}
- [can you] get me a flight from {city:fromCity} to {city:toCity}
- get me a flight to {city:toCity}
- I need to fly from {city:fromCity}

$city:Seattle=
- Seattle
- Tacoma
- SeaTac
- SEA

$city:Portland=
- Portland
- PDX

> ## Patterns
# DeleteAlarm
- delete the {alarmTime} alarm
# DeleteAlarm2
- delete the {alarmTime=7AM} alarm

> ## Phrase list definition
@ phraseList Want
@ phraseList Want =
    - require, need, desire, know


> You can also break up the phrase list values into an actual list

@ phraseList Want =
    - require
	- need
	- desire
  - know

  
> ## Utterances
# getUserProfile
- my name is vishwac and I'm 36 years old
    - my name is {@userProfile = vishwac and I'm 36 years old}
    - my name is {@firstName = vishwac} and I'm 36 years old
    - my name is vishwac and I'm {@userAge = 36} years old
- i'm {@userProfile = {@firstName = vishwac}}

@ ml userProfile
    - @personName firstName
    - @personName lastName

@ prebuilt personName


> ## External references
> You can include references to other .lu files

[All LU files](./all.lu)

> References to other files can have wildcards in them

[en-us](./en-us/*)

> References to other lu files can include sub-folders as well. 
> /** indicates to the parser to recursively look for .lu files in all subfolders as well.

[all LU files](../**)

> You can include deep references to intents defined in a .lu file in utterances

# None
- [None uttearnces](./all.lu#Help)

> With the above statement, the parser will parse all.lu and extract out all utterances associated with the 'Help' intent and add them under 'None' intent as defined in this file.

> NOTE: This **only** works for utterances as entities that are referenced by the uttearnces in the 'Help' intent will not be brought forward to this .lu file.

# All utterances
> you can use the *utterances* wild card to include all utterances from a lu file. This includes utterances across all intents defined in that .lu file. 
- [all.lu](./all.lu#*utterances*)
> you can use the *patterns* wild card to include all patterns from a lu file. 
> - [all.lu](./all.lu#*patterns*)
> you can use the *utterancesAndPatterns* wild card to include all utterances and patterns from a lu file. 
> - [all.lu](./all.lu#*utterancesAndPatterns*)

> You can include wild cards with deep references to QnA maker questions defined in a .qna file in utterances

# None
- [QnA questions](./*#?)

> With the above statement, the parser will parse **all** .lu files under ./, extract out all questions from QnA pairs in those files and add them under 'None' intent as defined in this file.

> You can include deep references to QnA maker questions defined in a .qna file in utterances

# None
- [QnA questions](./qna1.qna#?)

> With the above statement, the parser will parse qna1.lu and extract out all questions from QnA pairs in that file and add them under 'None' intent as defined in this file.
`;

export default function App() {
  const [value, setValue] = useState(content);

  const onChange = value => {
    setValue(value);
  };

  const props = {
    value,
    onChange,
    // options: {
    //   lineNumbers: 'on',
    //   minimap: {
    //     enabled: true,
    //   },
    //   // minimap: 'on',
    //   lineDecorationsWidth: undefined,
    //   lineNumbersMinChars: false,
    //   glyphMargin: true,
    //   autoClosingBrackets: 'always',
    //   autoIndent: true,
    //   lightbulb: {
    //     enabled: true,
    //   },
    // },
    languageServer: {
      port: 5000,
      path: '/lu-language-server',
    },
  };

  return (
    <LuEditor
      {...props}
      options={{
        lineNumbers: 'on',
        minimap: 'on',
        lineDecorationsWidth: undefined,
        lineNumbersMinChars: false,
        glyphMargin: true,
        autoClosingBrackets: 'always',
        wordBasedSuggestions: false,
        autoIndent: true,
        formatOnType: true,
        lightbulb: {
          enabled: true,
        },
      }}
    />
  );
}
