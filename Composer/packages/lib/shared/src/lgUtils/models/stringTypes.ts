// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

/**
 * example: 'hello' | '[bfdactivity-123456]'
 */
export type LgText = string;

/**
 * example: '[greetings()]' | '[bfdactivity-123456()]'
 */
export type LgTemplateRefString = string;

/**
 * example: 'greeting' | 'bfdactivity-123456'
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
  '[bfdactivity-1234]'
  '[greeting]'
  '[greeting(1)]'

  3. LgTemplateName
  'bfdactivity-1234' in '[bfdactivity-1234]'
  'greeting' in '[greeting(1)]'

  4. LgMetaData (Composer-only, can be converted to LgTemplateName)
  'bfdactivity-1234' => { type: 'activity', designerId: '1234' } // LgMetaData
  'greeting' => NO meta data since its not created by Composer
*/
