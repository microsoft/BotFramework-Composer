// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds } from '@botframework-composer/types';

import { walkAdaptiveDialog } from '../../../src/validations/schemaValidation/walkAdaptiveDialog';

import { simpleGreetingDialog } from './__mocks__/dialogMocks';
import { sdkSchemaDefinitionMock } from './__mocks__/sdkSchema';

describe('visitAdaptiveDialog', () => {
  it('should visit every adaptive elements in `simpleGreeting`', () => {
    const result: any = {};
    walkAdaptiveDialog(simpleGreetingDialog, sdkSchemaDefinitionMock, ($kind, _, path) => {
      result[path] = $kind;
      return true;
    });
    expect(result).toEqual(
      expect.objectContaining({
        '': SDKKinds.AdaptiveDialog,
        'triggers[0]': SDKKinds.OnConversationUpdateActivity,
        'triggers[0].actions[0]': SDKKinds.SwitchCondition,
        'triggers[0].actions[0].default[0]': SDKKinds.SendActivity,
        'triggers[0].actions[0].cases[0].actions[0]': SDKKinds.SendActivity,
      })
    );
  });
});
