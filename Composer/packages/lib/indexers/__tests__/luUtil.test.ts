// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { sectionHandler } from '@bfcomposer/bf-lu/lib/parser';

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

  it('update section with invalid lu syntax', () => {
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

    const invalidFileContent = `#CheckEmail
- check my email
- show my emails
@`;

    const invalidIntent = {
      Name: 'CheckEmail',
      Body: `- check my email
- show my emails
@`,
    };

    const invalidIntent4 = {
      Name: 'CheckEmail',
      Body: `- check my email
- show my emails

# UnexpectedIntentDefination
- unexpected intent body
`,
    };
    // intent invalid
    const updatedContent2 = updateIntent(validFileContent, intentName, invalidIntent);
    expect(updatedContent2).toEqual(validFileContent);
    const updatedContent4 = updateIntent(validFileContent, intentName, invalidIntent4);
    expect(updatedContent4).toEqual(validFileContent);
    // file invalid
    const updatedContent3 = updateIntent(invalidFileContent, intentName, validIntent);
    expect(updatedContent3).toEqual(invalidFileContent);
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
