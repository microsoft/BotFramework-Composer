// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License
import { PromptTab } from '@bfc/shared';

import { parseTypeToFragment } from '../../../src/utils/convertUtils/parseTypeToFragment';

describe('parseTypeToFragment', () => {
  it('should return corrent tab name', () => {
    expect(parseTypeToFragment('Microsoft.TextInput', 'unrecognizedPrompt')).toBe(PromptTab.OTHER);
    expect(parseTypeToFragment('Microsoft.TextInput', 'property')).toBe(PromptTab.USER_INPUT);
    expect(parseTypeToFragment('Microsoft.TextInput', 'prompt')).toBe(PromptTab.BOT_ASKS);
    expect(parseTypeToFragment('Microsoft.NumberInput', 'property')).toBe(PromptTab.USER_INPUT);
    expect(parseTypeToFragment('Microsoft.LuisRecognizer', 'property')).toBe('');
    expect(parseTypeToFragment('test', 'items')).toBe('');
  });
});
