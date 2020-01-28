/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/camelcase */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');

const util = require('../../lib/matchingPattern');

const text = `@ml location hasRoles homeaddress
@ composite city1
@ regex zipcode = /[0-9]{5}/
@ ml mail usesFeature address
#checktemperature
-it is sunny and the temperature is 
- the temperature is 35 
- address is {address=[beijing,100080]}
`;

const luisObject = {
  intents: [],
  entities: [{ name: 'address', roles: ['role1'] }],
  composites: [{ name: 'geoInfo', children: [], roles: [] }],
  closedLists: [{ name: 'city', subLists: [], roles: ['role2'] }],
  regex_entities: [
    {
      name: 'zipcode',
      regexPattern: '[0-9]{5}',
      roles: [],
    },
  ],
  model_features: [],
  regex_features: [],
  utterances: [],
  patterns: [],
  patternAnyEntities: [],
  prebuiltEntities: [],
};

describe('LU LSP Server Function Unit Tests', function() {
  it('Test Get ML Entities', function() {
    const result = util.getMLEntities(text);
    assert.deepStrictEqual(result, ['location', 'mail']);
  });

  it('Test Get Composites Entities', function() {
    const result = util.getCompositesEntities(luisObject);
    assert.deepStrictEqual(result, ['geoInfo']);
  });

  it('Test Get RegExp Entities', function() {
    const result = util.getRegexEntities(luisObject);
    assert.deepStrictEqual(result, ['zipcode']);
  });

  it('Test Get All Parsed Entities', function() {
    const result = util.getSuggestionEntities(luisObject, util.suggestionAllEntityTypes);
    assert.deepStrictEqual(result, ['address', 'zipcode', 'city', 'geoInfo']);
  });

  it('Test Get All Parsed Roles', function() {
    const result = util.getSuggestionRoles(luisObject, util.suggestionAllEntityTypes);
    assert.deepStrictEqual(result, ['role1', 'role2']);
  });

  it('Test Entity Can UsesFeature', function() {
    let lineContent = '@ geoInfo usesFeature ';
    let result = util.matchedEntityCanUsesFeature(lineContent, text, luisObject);
    assert.equal(result, true);

    lineContent = '@ composites newAddress2 usesFeature ';
    result = util.matchedEntityCanUsesFeature(lineContent, text, luisObject);
    assert.equal(result, true);

    lineContent = '@ ml newAddress usesFeature ';
    result = util.matchedEntityCanUsesFeature(lineContent, text, luisObject);
    assert.equal(result, true);

    lineContent = '@ zipcode usesFeature ';
    result = util.matchedEntityCanUsesFeature(lineContent, text, luisObject);
    assert.equal(result, false);
  });

  it('Test Intent Can UsesFeature', function() {
    let text = '@ intent mockIntent usesFeature ';
    let result = util.matchIntentUsesFeatures(text);
    assert.equal(result, true);

    text = '@ intent mockIntent useFeature ';
    result = util.matchIntentUsesFeatures(text);
    assert.equal(result, false);
  });

  it('Test Intent In a Entity Definiton', function() {
    let text = '@ intent mockIntent';
    let result = util.matchIntentInEntityDef(text);
    assert.equal(result, true);

    text = '@ intents mockIntent ';
    result = util.matchIntentInEntityDef(text);
    assert.equal(result, false);
  });

  it('Test Entity Definition', function() {
    let text = '@ ';
    let result = util.isEntityType(text);
    assert.equal(result, true);

    text = '@ ml ';
    result = util.isEntityType(text);
    assert.equal(result, false);
  });

  it('Test Prebuilt Entity Definition', function() {
    let text = '@ prebuilt ';
    let result = util.isPrebuiltEntity(text);
    assert.equal(result, true);

    text = '@ prebuilt ml1  ';
    result = util.isPrebuiltEntity(text);
    assert.equal(result, false);
  });

  it('Test RegExp Entity Definition', function() {
    let text = '@ regex zipcode =';
    let result = util.isRegexEntity(text);
    assert.equal(result, true);

    text = '@ ml ml1  ';
    result = util.isRegexEntity(text);
    assert.equal(result, false);
  });

  it('Test Seperated Line Entity', function() {
    let text = '@ zipcode =';
    let result = util.isSeperatedEntityDef(text);
    assert.equal(result, true);

    text = '@ ml ml1  ';
    result = util.isSeperatedEntityDef(text);
    assert.equal(result, false);
  });

  it('Test Entity Name ', function() {
    let text = '@ ml location';
    let result = util.isEntityName(text);
    assert.equal(result, true);

    text = '@ location';
    result = util.isEntityName(text);
    assert.equal(result, true);

    text = '@ intent ';
    result = util.isEntityName(text);
    assert.equal(result, false);
  });

  it('Test Composite Entity ', function() {
    let text = '@ composite location = [';
    let result = util.isCompositeEntity(text);
    assert.equal(result, true);

    text = '@ composite location = []';
    result = util.isCompositeEntity(text);
    assert.equal(result, true);

    text = '@ intent ';
    result = util.isCompositeEntity(text);
    assert.equal(result, false);
  });

  it('Test Entering Pattern ', function() {
    let text = '- The weather in Seattle is { ';
    let result = util.matchedEnterPattern(text);
    assert.equal(result, true);

    text = '- The weather in Seattle is { }';
    result = util.matchedEnterPattern(text);
    assert.equal(result, true);

    text = '- The weather in Seattle is ';
    result = util.matchedEnterPattern(text);
    assert.equal(result, false);
  });

  it('Test Entering Roles ', function() {
    let text = '- The weather in Seattle is {morning: ';
    let result = util.matchedRolesPattern(text);
    assert.equal(result, true);

    text = '- The weather in Seattle is {morning: }';
    result = util.matchedRolesPattern(text);
    assert.equal(result, true);

    text = '- The weather in Seattle is { ';
    result = util.matchedRolesPattern(text);
    assert.equal(result, false);
  });

  it('Test Entering Entity ', function() {
    let text = '- The weather in Seattle is {@ ';
    let result = util.matchedEntityPattern(text);
    assert.equal(result, true);

    text = '- The weather in Seattle is {@}';
    result = util.matchedEntityPattern(text);
    assert.equal(result, true);

    text = '- The weather in Seattle is { ';
    result = util.matchedEntityPattern(text);
    assert.equal(result, false);
  });

  it('Test Remove Labeled Utterance', function() {
    let text = '- this is a {type = Audio} message from {device = PC}';
    let result = util.removeLabelsInUtterance(text);
    assert.equal(result, '- this is a Audio message from PC');

    text = '- this is a {@ type = Audio} message from {@device = PC}';
    result = util.removeLabelsInUtterance(text);
    assert.equal(result, '- this is a Audio message from PC');

    text = '- this is a { type: role =Audio} message from {@device = PC}';
    result = util.removeLabelsInUtterance(text);
    assert.equal(result, '- this is a Audio message from PC');
  });
});
