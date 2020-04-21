// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

/**
 * example: 'hello' | '[SendActivity_123456]'
 */
export type LgText = string;

/**
 * example: '[greetings()]' | '[SendActivity_123456()]'
 */
export type LgTemplateRefString = string;

/**
 * example: 'greeting' | 'SendActivity_123456'
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
  '[SendActivity_1234]'
  '[greeting]'
  '[greeting(1)]'

  3. LgTemplateName
  'SendActivity_1234' in '[SendActivity_1234]'
  'greeting' in '[greeting(1)]'

  4. LgMetaData (Composer-only, can be converted to LgTemplateName)
  'SendActivity_1234' => { type: 'SendActivity', designerId: '1234' } // LgMetaData
  'greeting' => NO meta data since its not created by Composer
*/
