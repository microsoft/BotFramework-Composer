// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface TriggerFormDataErrors {
  /** Error msg of L1 dropdown 'type of Trigger'. */
  $kind?: string;

  /** Error msg of L2 dropdown 'Dialog events'. */
  event?: string;

  /** Error msg of L2 dropdown 'Activities'. */
  activity?: string;

  /** Error msg of [tirgger=OnIntent, recognizer=RegEx] regex value. */
  regEx?: string;

  /** Error msg of [tirgger=OnIntent, recognizer=LUIS] intent name. */
  intent?: string;

  /** Error msg of [tirgger=OnIntent, recognizer=LUIS] lu phrases. */
  triggerPhrases?: string;
}
