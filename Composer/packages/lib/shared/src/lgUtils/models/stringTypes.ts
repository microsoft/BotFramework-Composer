// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

/**
 * example: 'hello' | '[bfdactivity_123456]'
 */
export type LgText = string;

/**
 * example: '[greetings()]' | '[bfdactivity_123456()]'
 */
export type LgTemplateRefString = string;

/**
 * example: 'greeting' | 'bfdactivity_123456'
 */
export type LgTemplateName = string;

/**
 * How we understand LG strings:
  1. LgText
  {
      "activity": "....", // LgText
      "prompt": "....", // LgText
      "invalidPrompt": "..." // LgText
  }

  2. LgTemplateRef
  '[bfdactivity_1234]'
  '[greeting]'
  '[greeting(1)]'

  3. LgTemplateName
  'bfdactivity_1234' in '[bfdactivity_1234]'
  'greeting' in '[greeting(1)]'

  4. LgMetaData (Composer-only, can be converted to LgTemplateName)
  'bfdactivity_1234' => { type: 'activity', designerId: '1234' } // LgMetaData
  'greeting' => NO meta data since its not created by Composer
*/
