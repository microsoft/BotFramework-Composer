// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { LgTemplate } from '@bfc/shared';

import { validateStructuredResponse } from '../lgValidate';

const validTemplate: LgTemplate = {
  name: 'template1',
  parameters: [],
  body: `[Activity\n    Text = text\n    Speak=speak\n]`,
  properties: {
    $type: 'Activity',
    Text: 'text',
    Speak: 'speak',
  },
};

const emptyTemplate1: LgTemplate = {
  name: 'template2',
  parameters: [],
  body: '',
};

const emptyTemplate2: LgTemplate = {
  name: 'template3',
  parameters: [],
  body: '',
};

const nonActivityTemplate1: LgTemplate = {
  name: 'template4',
  parameters: [],
  body: '- test1\n- test2\n- test3',
};

const nonActivityTemplate2: LgTemplate = {
  name: 'template5',
  parameters: [],
  body: `[Herocard\n    title = title\n]`,
  properties: {
    $type: 'Herocard',
    title: 'title',
  },
};

describe('lgValidate', () => {
  it('validateStructuredResponse: should return true for valid LG template with Activity structured response', () => {
    const valid = validateStructuredResponse(validTemplate);
    expect(valid).toBeTruthy();
  });

  it('validateStructuredResponse: should return true for empty LG template', () => {
    expect(validateStructuredResponse(emptyTemplate1)).toBeTruthy();
    expect(validateStructuredResponse(emptyTemplate2)).toBeTruthy();
  });

  it('validateStructuredResponse: should return false for valid LG template without Activity structured response', () => {
    expect(validateStructuredResponse(nonActivityTemplate1)).toBeFalsy();
    expect(validateStructuredResponse(nonActivityTemplate2)).toBeFalsy();
  });
});
