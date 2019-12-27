// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { sectionHandler } from '@bfcomposer/bf-lu/lib/parser';

import { updateIntent, addIntent, removeIntent } from '../../src/utils/luUtil';

const { luParser, luSectionTypes } = sectionHandler;

describe('LU Section CRUD test', () => {
  let fileContent = `# Greeting
  - hi
  - hello`;

  it('init section test', () => {
    const luresource = luParser.parse(fileContent);
    const { Sections, Errors, Content } = luresource;

    expect(Content).toEqual(fileContent);
    expect(Errors.length).toEqual(0);
    expect(Sections.length).toEqual(1);
    expect(Sections[0].Errors.length).toEqual(0);
    expect(luresource.Sections[0].SectionType).toEqual(luSectionTypes.SIMPLEINTENTSECTION);
    expect(luresource.Sections[0].Name).toEqual('Greeting');
    expect(luresource.Sections[0].UtteranceAndEntitiesMap.length).toEqual(2);
    expect(luresource.Sections[0].UtteranceAndEntitiesMap[0].utterance).toEqual('hi');
    expect(luresource.Sections[0].UtteranceAndEntitiesMap[1].utterance).toEqual('hello');
  });

  it('add simpleIntentSection test', () => {
    const intent = {
      name: 'CheckEmail',
      body: `- check my email
      - show my emails`,
    };

    fileContent = addIntent(fileContent, intent);
    const luresource = luParser.parse(fileContent);
    const { Sections, Errors } = luresource;

    expect(Errors.length).toEqual(0);
    expect(Sections.length).toEqual(2);
    expect(Sections[1].Errors.length).toEqual(0);
    expect(luresource.Sections[1].SectionType).toEqual(luSectionTypes.SIMPLEINTENTSECTION);
    expect(luresource.Sections[1].Name).toEqual('CheckEmail');
    expect(luresource.Sections[1].UtteranceAndEntitiesMap.length).toEqual(2);
    expect(luresource.Sections[1].UtteranceAndEntitiesMap[0].utterance).toEqual('check my email');
    expect(luresource.Sections[1].UtteranceAndEntitiesMap[1].utterance).toEqual('show my emails');
  });

  it('update section test', () => {
    const name = 'CheckEmail';

    const intent = {
      name,
      body: `- check my email
      - show my emails
      - check my mail box please`,
    };

    fileContent = updateIntent(fileContent, name, intent);
    const luresource = luParser.parse(fileContent);

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

  it('delete section test', () => {
    const name = 'CheckEmail';
    fileContent = removeIntent(fileContent, name);
    const luresource = luParser.parse(fileContent);

    const { Sections, Errors } = luresource;

    expect(Errors.length).toEqual(0);
    expect(Sections.length).toEqual(1);
    expect(Sections[0].Errors.length).toEqual(0);
    expect(luresource.Sections[0].SectionType).toEqual(luSectionTypes.SIMPLEINTENTSECTION);
    expect(luresource.Sections[0].Name).toEqual('Greeting');
  });
});
