// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { sectionHandler } from '@microsoft/bf-lu/lib/parser/composerindex';

import { updateIntent, addIntent, removeIntent } from '../src/utils/luUtil';

const { luParser, luSectionTypes } = sectionHandler;

describe('LU Section CRUD test', () => {
  const fileContent = `# Greeting
- hi
- hello

# CheckEmail
- check my email
- show my emails
`;

  const fileContentError1 = `# Greeting
> not start with  -
hi
- hello

# CheckEmail
- check my email
- show my emails

# Foo
> nothing in body
`;

  it('parse section test', () => {
    const luresource = luParser.parse(fileContent);
    const { Sections, Errors, Content } = luresource;

    expect(Content).toEqual(fileContent);
    expect(Errors.length).toEqual(0);
    expect(Sections.length).toEqual(2);
    expect(Sections[0].Errors.length).toEqual(0);
    expect(luresource.Sections[0].SectionType).toEqual(luSectionTypes.SIMPLEINTENTSECTION);
    expect(luresource.Sections[0].Name).toEqual('Greeting');
    expect(luresource.Sections[0].UtteranceAndEntitiesMap.length).toEqual(2);
    expect(luresource.Sections[0].UtteranceAndEntitiesMap[0].utterance).toEqual('hi');
    expect(luresource.Sections[0].UtteranceAndEntitiesMap[1].utterance).toEqual('hello');
  });

  it('parse section with syntax error test', () => {
    const luresource = luParser.parse(fileContentError1);
    const { Sections, Errors, Content } = luresource;

    expect(Content).toEqual(fileContentError1);
    expect(Errors.length).toEqual(2);
    expect(Sections.length).toEqual(3);
    expect(Sections[0].Errors.length).toEqual(1);
    expect(Sections[2].Errors.length).toEqual(1);
  });

  it('add simpleIntentSection test', () => {
    const intent = {
      Name: 'CheckUnreadEmail',
      Body: `- check my unread email
      - show my unread emails`,
    };

    const fileContentUpdated = addIntent(fileContent, intent);
    const luresource = luParser.parse(fileContentUpdated);
    const { Sections, Errors } = luresource;

    expect(Errors.length).toEqual(0);
    expect(Sections.length).toEqual(3);
    expect(Sections[2].Errors.length).toEqual(0);
    expect(luresource.Sections[2].SectionType).toEqual(luSectionTypes.SIMPLEINTENTSECTION);
    expect(luresource.Sections[2].Name).toEqual('CheckUnreadEmail');
    expect(luresource.Sections[2].UtteranceAndEntitiesMap.length).toEqual(2);
    expect(luresource.Sections[2].UtteranceAndEntitiesMap[0].utterance).toEqual('check my unread email');
    expect(luresource.Sections[2].UtteranceAndEntitiesMap[1].utterance).toEqual('show my unread emails');
  });

  it('update section test', () => {
    const intentName = 'CheckEmail';

    const intent = {
      Name: 'CheckEmail',
      Body: `- check my email
- show my emails
- check my mail box please`,
    };

    const fileContentUpdated = updateIntent(fileContent, intentName, intent);
    const luresource = luParser.parse(fileContentUpdated);

    const { Sections, Errors } = luresource;

    expect(Errors.length).toEqual(0);
    expect(Sections.length).toEqual(2);
    expect(Sections[1].Errors.length).toEqual(0);
    expect(luresource.Sections[1].SectionType).toEqual(luSectionTypes.SIMPLEINTENTSECTION);
    expect(luresource.Sections[1].Name).toEqual('CheckEmail');
    expect(luresource.Sections[1].UtteranceAndEntitiesMap.length).toEqual(3);
    expect(luresource.Sections[1].UtteranceAndEntitiesMap[0].utterance).toEqual('check my email');
    expect(luresource.Sections[1].UtteranceAndEntitiesMap[1].utterance).toEqual('show my emails');
    expect(luresource.Sections[1].UtteranceAndEntitiesMap[2].utterance).toEqual('check my mail box please');
  });

  it('update section with syntax error: missing -', () => {
    const intentName = 'CheckEmail';

    const validFileContent = `#CheckEmail
- check my email
- show my emails`;

    const validIntent = {
      Name: 'CheckEmail',
      Body: `- check my email
- show my emails
`,
    };

    const invalidIntent = {
      Name: 'CheckEmail',
      Body: `check my email
- show my emails
`,
    };

    // when intent invalid, after update can still be parsed
    const updatedContent2 = updateIntent(validFileContent, intentName, invalidIntent);
    const updatedContent2Parsed = luParser.parse(updatedContent2);
    expect(updatedContent2Parsed.Sections.length).toEqual(1);
    expect(updatedContent2Parsed.Errors.length).toBeGreaterThan(0);
    // when file invalid, update with valid intent should fix error.
    const updatedContent3 = updateIntent(updatedContent2, intentName, validIntent);
    const updatedContent3Parsed = luParser.parse(updatedContent3);
    expect(updatedContent3Parsed.Sections.length).toEqual(1);
    expect(updatedContent3Parsed.Errors.length).toEqual(0);
  });

  it('update section with syntax error: end with empty entity @', () => {
    const intentName = 'CheckEmail';

    const validFileContent = `#CheckEmail
- check my email
- show my emails`;

    const invalidIntent = {
      Name: 'CheckEmail',
      Body: `- check my email
- show my emails
@`,
    };

    // when intent invalid, after update can still be parsed
    const updatedContent2 = updateIntent(validFileContent, intentName, invalidIntent);
    const updatedContent2Parsed = luParser.parse(updatedContent2);
    expect(updatedContent2Parsed.Errors.length).toBeGreaterThan(0);
    // TODO: update back should fix error.
    // const updatedContent3 = updateIntent(updatedContent2, intentName, validIntent);
    // expect(updatedContent3).toEqual(validFileContent);
  });

  it('update section with syntax error: include # IntentName in body', () => {
    const intentName = 'CheckEmail';

    const validFileContent = `#CheckEmail
- check my email
- show my emails`;

    const invalidIntent = {
      Name: 'CheckEmail',
      Body: `- check my email
- show my emails

# UnexpectedIntentDefination
`,
    };
    // should auto escape # to \#
    const updatedContent2 = updateIntent(validFileContent, intentName, invalidIntent);
    const { Sections, Errors } = luParser.parse(updatedContent2);
    expect(Errors.length).toEqual(0);
    expect(Sections.length).toEqual(1);
    expect(Sections[0].Errors.length).toEqual(0);
    expect(Sections[0].SectionType).toEqual(luSectionTypes.SIMPLEINTENTSECTION);
    expect(Sections[0].UtteranceAndEntitiesMap.length).toEqual(3);
    expect(Sections[0].UtteranceAndEntitiesMap[2].utterance).toEqual('\\# UnexpectedIntentDefination');
  });

  it('delete section test', () => {
    const intentName = 'CheckEmail';
    const fileContentUpdated = removeIntent(fileContent, intentName);
    const luresource = luParser.parse(fileContentUpdated);

    const { Sections, Errors } = luresource;

    expect(Errors.length).toEqual(0);
    expect(Sections.length).toEqual(1);
    expect(Sections[0].Errors.length).toEqual(0);
    expect(luresource.Sections[0].SectionType).toEqual(luSectionTypes.SIMPLEINTENTSECTION);
    expect(luresource.Sections[0].Name).toEqual('Greeting');
  });
});

describe('LU Nested Section CRUD test', () => {
  const fileContent = `> !# @enableSections = true

# CheckTodo
## CheckUnreadTodo
- check my unread todo
- show my unread todos

@ simple todoTitle

## CheckDeletedTodo
- check my deleted todo
- show my deleted todos

@ simple todoSubject`;

  it('update IntentSection test', () => {
    const intentName = 'CheckTodo';
    const intent = {
      Name: 'CheckTodo',
      Body: `## CheckUnreadTodo
  - please check my unread todo
  - show my unread todos

  @ simple todoTitle
  `,
    };

    const fileContentUpdated = updateIntent(fileContent, intentName, intent);
    const luresource = luParser.parse(fileContentUpdated);
    const { Sections, Errors } = luresource;

    expect(Errors.length).toEqual(0);
    expect(Sections.length).toEqual(2);
    expect(Sections[0].SectionType).toEqual(luSectionTypes.MODELINFOSECTION);
    expect(Sections[1].SectionType).toEqual(luSectionTypes.NESTEDINTENTSECTION);
    expect(Sections[1].Name).toEqual('CheckTodo');
    expect(Sections[1].SimpleIntentSections.length).toEqual(1);
  });

  it('parse Nested section test', () => {
    const luresource = luParser.parse(fileContent);
    const { Sections, Errors, Content } = luresource;

    expect(Content).toEqual(fileContent);
    expect(Errors.length).toEqual(0);
    expect(Sections.length).toEqual(2);
    expect(Sections[0].SectionType).toEqual(luSectionTypes.MODELINFOSECTION);
    expect(Sections[1].SectionType).toEqual(luSectionTypes.NESTEDINTENTSECTION);
    expect(Sections[1].Name).toEqual('CheckTodo');
    expect(Sections[1].SimpleIntentSections.length).toEqual(2);
    expect(Sections[1].SimpleIntentSections[0].Name).toEqual('CheckUnreadTodo');
    expect(Sections[1].SimpleIntentSections[0].SectionType).toEqual(luSectionTypes.SIMPLEINTENTSECTION);
    expect(Sections[1].SimpleIntentSections[0].Errors.length).toEqual(0);
    expect(Sections[1].SimpleIntentSections[0].Entities.length).toEqual(1);
    expect(Sections[1].SimpleIntentSections[0].UtteranceAndEntitiesMap.length).toEqual(2);
    expect(Sections[1].SimpleIntentSections[0].UtteranceAndEntitiesMap[0].utterance).toEqual('check my unread todo');
    expect(Sections[1].SimpleIntentSections[0].UtteranceAndEntitiesMap[1].utterance).toEqual('show my unread todos');
  });

  it('add nestedIntentSection test', () => {
    const intent = {
      Name: 'CheckTodo/CheckCompletedTodo',
      Body: `- check my completed todo
    - show my completed todos

    @ simple todoTime
    `,
    };

    const fileContentUpdated = addIntent(fileContent, intent);
    const luresource = luParser.parse(fileContentUpdated);
    const { Sections, Errors } = luresource;

    expect(Errors.length).toEqual(0);
    expect(Sections.length).toEqual(2);
    expect(Sections[0].SectionType).toEqual(luSectionTypes.MODELINFOSECTION);
    expect(Sections[1].SectionType).toEqual(luSectionTypes.NESTEDINTENTSECTION);
    expect(Sections[1].Name).toEqual('CheckTodo');
    expect(Sections[1].SimpleIntentSections.length).toEqual(3);
    expect(Sections[1].SimpleIntentSections[2].Name).toEqual('CheckCompletedTodo');
    expect(Sections[1].SimpleIntentSections[2].SectionType).toEqual(luSectionTypes.SIMPLEINTENTSECTION);
    expect(Sections[1].SimpleIntentSections[2].Errors.length).toEqual(0);
    expect(Sections[1].SimpleIntentSections[2].Entities.length).toEqual(1);
    expect(Sections[1].SimpleIntentSections[2].Entities[0].Name).toEqual('todoTime');
    expect(Sections[1].SimpleIntentSections[2].UtteranceAndEntitiesMap.length).toEqual(2);
    expect(Sections[1].SimpleIntentSections[2].UtteranceAndEntitiesMap[0].utterance).toEqual('check my completed todo');
    expect(Sections[1].SimpleIntentSections[2].UtteranceAndEntitiesMap[1].utterance).toEqual('show my completed todos');
  });

  it('add nestedIntentSection test, recursive', () => {
    const intent = {
      Name: 'CheckMyTodo/CheckCompletedTodo',
      Body: `- check my completed todo
    - show my completed todos

    @ simple todoTime
    `,
    };

    const fileContentUpdated = addIntent(fileContent, intent);
    const luresource = luParser.parse(fileContentUpdated);
    const { Sections, Errors } = luresource;

    expect(Errors.length).toEqual(0);
    expect(Sections.length).toEqual(3);
    expect(Sections[0].SectionType).toEqual(luSectionTypes.MODELINFOSECTION);
    expect(Sections[1].SectionType).toEqual(luSectionTypes.NESTEDINTENTSECTION);
    expect(Sections[2].SectionType).toEqual(luSectionTypes.NESTEDINTENTSECTION);
    expect(Sections[2].Name).toEqual('CheckMyTodo');
    expect(Sections[2].SimpleIntentSections.length).toEqual(1);
    expect(Sections[2].SimpleIntentSections[0].Name).toEqual('CheckCompletedTodo');
    expect(Sections[2].SimpleIntentSections[0].SectionType).toEqual(luSectionTypes.SIMPLEINTENTSECTION);
    expect(Sections[2].SimpleIntentSections[0].Errors.length).toEqual(0);
    expect(Sections[2].SimpleIntentSections[0].Entities.length).toEqual(1);
    expect(Sections[2].SimpleIntentSections[0].Entities[0].Name).toEqual('todoTime');
    expect(Sections[2].SimpleIntentSections[0].UtteranceAndEntitiesMap.length).toEqual(2);
    expect(Sections[2].SimpleIntentSections[0].UtteranceAndEntitiesMap[0].utterance).toEqual('check my completed todo');
    expect(Sections[2].SimpleIntentSections[0].UtteranceAndEntitiesMap[1].utterance).toEqual('show my completed todos');
  });

  it('update nestedIntentSection test', () => {
    const intentName = 'CheckTodo/CheckUnreadTodo';
    const intent = {
      Name: 'CheckMyUnreadTodo',
      Body: `- please check my unread todo
    - please show my unread todos

    @ simple todoTitle
    @ simple todoContent
    `,
    };

    const fileContentUpdated = updateIntent(fileContent, intentName, intent);
    const luresource = luParser.parse(fileContentUpdated);
    const { Sections, Errors } = luresource;

    expect(Errors.length).toEqual(0);
    expect(Sections.length).toEqual(2);
    expect(Sections[0].SectionType).toEqual(luSectionTypes.MODELINFOSECTION);
    expect(Sections[1].SectionType).toEqual(luSectionTypes.NESTEDINTENTSECTION);
    expect(Sections[1].Name).toEqual('CheckTodo');
    expect(Sections[1].SimpleIntentSections.length).toEqual(2);
    expect(Sections[1].SimpleIntentSections[0].Name).toEqual('CheckMyUnreadTodo');
    expect(Sections[1].SimpleIntentSections[0].SectionType).toEqual(luSectionTypes.SIMPLEINTENTSECTION);
    expect(Sections[1].SimpleIntentSections[0].Errors.length).toEqual(0);
    expect(Sections[1].SimpleIntentSections[0].Entities.length).toEqual(2);
    expect(Sections[1].SimpleIntentSections[0].Entities[1].Name).toEqual('todoContent');
    expect(Sections[1].SimpleIntentSections[0].UtteranceAndEntitiesMap.length).toEqual(2);
    expect(Sections[1].SimpleIntentSections[0].UtteranceAndEntitiesMap[0].utterance).toEqual(
      'please check my unread todo'
    );
    expect(Sections[1].SimpleIntentSections[0].UtteranceAndEntitiesMap[1].utterance).toEqual(
      'please show my unread todos'
    );
  });

  it('update nestedIntentSection and escape # in body', () => {
    const intentName = 'CheckTodo/CheckUnreadTodo';
    const intent = {
      Name: 'CheckMyUnreadTodo',
      Body: `- please check my unread todo
- please show my unread todos
# Oops
## Oops
@ simple todoTitle
@ simple todoContent
`,
    };

    const fileContentUpdated = updateIntent(fileContent, intentName, intent);
    const luresource = luParser.parse(fileContentUpdated);
    const { Sections, Errors } = luresource;

    expect(Errors.length).toEqual(0);
    expect(Sections.length).toEqual(2);
    expect(Sections[0].SectionType).toEqual(luSectionTypes.MODELINFOSECTION);
    expect(Sections[1].SectionType).toEqual(luSectionTypes.NESTEDINTENTSECTION);
    expect(Sections[1].Name).toEqual('CheckTodo');
    expect(Sections[1].SimpleIntentSections.length).toEqual(2);
    expect(Sections[1].SimpleIntentSections[0].Name).toEqual('CheckMyUnreadTodo');
    expect(Sections[1].SimpleIntentSections[0].SectionType).toEqual(luSectionTypes.SIMPLEINTENTSECTION);
    expect(Sections[1].SimpleIntentSections[0].Errors.length).toEqual(0);
    expect(Sections[1].SimpleIntentSections[0].Entities.length).toEqual(2);
    expect(Sections[1].SimpleIntentSections[0].Entities[1].Name).toEqual('todoContent');
    expect(Sections[1].SimpleIntentSections[0].UtteranceAndEntitiesMap.length).toEqual(4);
    expect(Sections[1].SimpleIntentSections[0].UtteranceAndEntitiesMap[0].utterance).toEqual(
      'please check my unread todo'
    );
    expect(Sections[1].SimpleIntentSections[0].UtteranceAndEntitiesMap[2].utterance).toEqual('\\# Oops');
    expect(Sections[1].SimpleIntentSections[0].UtteranceAndEntitiesMap[3].utterance).toEqual('\\## Oops');
  });

  it('update nestedIntentSection with # ## ### in body', () => {
    const intentName = 'CheckTodo';
    const intentBody1 = `# Oops
## Oops
### Oops
`;

    const fileContentUpdated1 = updateIntent(fileContent, intentName, { Name: intentName, Body: intentBody1 });
    const luresource1 = luParser.parse(fileContentUpdated1);
    expect(luresource1.Sections.length).toBeGreaterThan(0);
    expect(luresource1.Errors.length).toBeGreaterThan(0);

    const intentBody2 = `## Oops
    ### Oops
    `;
    const fileContentUpdated2 = updateIntent(fileContent, intentName, { Name: intentName, Body: intentBody2 });
    const luresource2 = luParser.parse(fileContentUpdated2);
    expect(luresource2.Sections.length).toEqual(2);
    expect(luresource2.Errors.length).toBeGreaterThan(0);
    expect(luresource2.Sections[0].SectionType).toEqual(luSectionTypes.MODELINFOSECTION);
    expect(luresource2.Sections[1].SectionType).toEqual(luSectionTypes.NESTEDINTENTSECTION);

    // if nestedSection not enable
    const fileContent3 = `# Greeting
- hi

# CheckTodo
- please check my todo
`;
    const intentBody3 = `## Oops
### Oops
`;
    const fileContentUpdated3 = updateIntent(fileContent3, intentName, { Name: intentName, Body: intentBody3 });
    const luresource3 = luParser.parse(fileContentUpdated3);
    expect(luresource3.Sections.length).toBeGreaterThan(0);
    expect(luresource3.Errors.length).toBeGreaterThan(0);
  });

  /**
   * this will add #CheckMyTodo
   * in #CheckMyTodo, ##CheckUnreadTodo not exist, then will do add ##CheckMyUnreadTodo
   */
  it('update nestedIntentSection test, recursive', () => {
    const intentName = 'CheckMyTodo/CheckUnreadTodo';
    const intent = {
      Name: 'CheckMyUnreadTodo',
      Body: `- please check my unread todo
  - please show my unread todos

  @ simple todoContent
  `,
    };

    const fileContentUpdated = updateIntent(fileContent, intentName, intent);
    const luresource = luParser.parse(fileContentUpdated);
    const { Sections, Errors } = luresource;

    expect(Errors.length).toEqual(0);
    expect(Sections.length).toEqual(3);
    expect(Sections[0].SectionType).toEqual(luSectionTypes.MODELINFOSECTION);
    expect(Sections[1].SectionType).toEqual(luSectionTypes.NESTEDINTENTSECTION);
    expect(Sections[2].SectionType).toEqual(luSectionTypes.NESTEDINTENTSECTION);
    expect(Sections[2].Name).toEqual('CheckMyTodo');
    expect(Sections[2].SimpleIntentSections.length).toEqual(1);
    expect(Sections[2].SimpleIntentSections[0].Name).toEqual('CheckMyUnreadTodo');
    expect(Sections[2].SimpleIntentSections[0].SectionType).toEqual(luSectionTypes.SIMPLEINTENTSECTION);
    expect(Sections[2].SimpleIntentSections[0].Errors.length).toEqual(0);
    expect(Sections[2].SimpleIntentSections[0].Entities.length).toEqual(1);
    expect(Sections[2].SimpleIntentSections[0].Entities[0].Name).toEqual('todoContent');
    expect(Sections[2].SimpleIntentSections[0].UtteranceAndEntitiesMap.length).toEqual(2);
    expect(Sections[2].SimpleIntentSections[0].UtteranceAndEntitiesMap[0].utterance).toEqual(
      'please check my unread todo'
    );
    expect(Sections[2].SimpleIntentSections[0].UtteranceAndEntitiesMap[1].utterance).toEqual(
      'please show my unread todos'
    );
  });

  it('delete nestedIntentSection test', () => {
    const Name = 'CheckTodo/CheckUnreadTodo';
    const fileContentUpdated = removeIntent(fileContent, Name);
    const luresource = luParser.parse(fileContentUpdated);

    const { Sections, Errors } = luresource;

    expect(Errors.length).toEqual(0);
    expect(Sections.length).toEqual(2);
    expect(Sections[0].SectionType).toEqual(luSectionTypes.MODELINFOSECTION);
    expect(Sections[1].SectionType).toEqual(luSectionTypes.NESTEDINTENTSECTION);
    expect(Sections[1].Name).toEqual('CheckTodo');
    expect(Sections[1].SimpleIntentSections.length).toEqual(1);
    expect(Sections[1].SimpleIntentSections[0].Name).toEqual('CheckDeletedTodo');
    expect(Sections[1].SimpleIntentSections[0].SectionType).toEqual(luSectionTypes.SIMPLEINTENTSECTION);
    expect(Sections[1].SimpleIntentSections[0].Errors.length).toEqual(0);
    expect(Sections[1].SimpleIntentSections[0].Entities.length).toEqual(1);
    expect(Sections[1].SimpleIntentSections[0].UtteranceAndEntitiesMap.length).toEqual(2);
    expect(Sections[1].SimpleIntentSections[0].UtteranceAndEntitiesMap[0].utterance).toEqual('check my deleted todo');
    expect(Sections[1].SimpleIntentSections[0].UtteranceAndEntitiesMap[1].utterance).toEqual('show my deleted todos');
  });

  it('delete nestedIntentSection test, parrent not exist', () => {
    const Name = 'CheckTodoNotExist/CheckUnreadTodo';
    const fileContentUpdated = removeIntent(fileContent, Name);
    const luresource = luParser.parse(fileContentUpdated);
    const { Content } = luresource;
    expect(Content).toEqual(fileContent);
  });

  it('delete nestedIntentSection test, child not exist', () => {
    const Name = 'CheckTodo/CheckUnreadTodoNotExist';
    const fileContentUpdated = removeIntent(fileContent, Name);
    const luresource = luParser.parse(fileContentUpdated);
    const { Content } = luresource;
    expect(Content).toEqual(fileContent);
  });
});
