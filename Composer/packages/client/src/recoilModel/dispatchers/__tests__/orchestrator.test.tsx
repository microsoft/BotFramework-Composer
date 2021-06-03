// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RecognizerFile, SDKKinds } from '@bfc/shared';

import { availableLanguageModels } from '../orchestrator';

describe('Orchestrator model picking logic', () => {
  it('no language returned if empty or invalid id, or non-orchestrator recognizer', () => {
    const recognizerFiles: RecognizerFile[] = [
      { id: 'test.en-us.dialog', content: { $kind: SDKKinds.LuisRecognizer } },
      { id: 'test.zh-cn.dialog', content: { $kind: SDKKinds.LuisRecognizer } },
      { id: 'nonsense-file', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      { id: '..', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      { id: '.', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      { id: '', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      { id: 'nonsense-file.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      { id: 'en-us', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      { id: 'test.nonsense-locale.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } },
    ];
    expect(availableLanguageModels(recognizerFiles)).toHaveLength(0);
    expect(availableLanguageModels([])).toHaveLength(0);
  });

  it('return en model only once', () => {
    const recognizerFiles: RecognizerFile[] = [
      { id: 'test.zh-cn.dialog', content: { $kind: SDKKinds.LuisRecognizer } },
      { id: 'test.en.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      { id: 'test.EN.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      { id: 'test.en-us.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      { id: 'test.en-sg.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } },
    ];
    expect(availableLanguageModels(recognizerFiles)).toHaveLength(1);
    expect(availableLanguageModels(recognizerFiles)).toEqual([{ kind: 'en_intent', name: 'default' }]);
  });

  it('return en model under correct circumstances', () => {
    const enModel = { kind: 'en_intent', name: 'default' };
    expect(
      availableLanguageModels([{ id: 'test.en-us.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } }])
    ).toEqual([enModel]);
    expect(
      availableLanguageModels([{ id: 'test.EN-us.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } }])
    ).toEqual([enModel]);
    expect(
      availableLanguageModels([{ id: 'test.en-US.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } }])
    ).toEqual([enModel]);
    expect(
      availableLanguageModels([{ id: 'test.en.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } }])
    ).toEqual([enModel]);
    expect(
      availableLanguageModels([{ id: 'test.en-anything.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } }])
    ).toEqual([enModel]);
  });

  it('return multilang model under correct circumstances', () => {
    const multilingualModel = { kind: 'multilingual_intent', name: 'default' };
    expect(
      availableLanguageModels([{ id: 'test.it.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } }])
    ).toEqual([multilingualModel]);
    expect(
      availableLanguageModels([{ id: 'test.jp.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } }])
    ).toHaveLength(0);
    expect(
      availableLanguageModels([{ id: 'test.ja.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } }])
    ).toHaveLength(1);

    expect(
      availableLanguageModels([{ id: 'test.zh-cn.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } }])
    ).toEqual([multilingualModel]);
    expect(
      availableLanguageModels([{ id: 'test.zh-CN.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } }])
    ).toEqual([multilingualModel]);
    expect(
      availableLanguageModels([{ id: 'test.rwk-tz.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } }])
    ).toEqual([multilingualModel]);
    expect(availableLanguageModels([{ id: 'test.pap', content: { $kind: SDKKinds.OrchestratorRecognizer } }])).toEqual([
      multilingualModel,
    ]);
    expect(
      availableLanguageModels([{ id: 'test.tr-cy', content: { $kind: SDKKinds.OrchestratorRecognizer } }])
    ).toEqual([multilingualModel]);
    expect(
      availableLanguageModels([{ id: 'test.nope', content: { $kind: SDKKinds.OrchestratorRecognizer } }])
    ).toHaveLength(0);
  });

  it('return all models when multiple languages are detected', () => {
    const recognizerFiles: RecognizerFile[] = [
      { id: 'test.en-us.', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      { id: 'test.en.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      { id: 'test.fr-be.', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      { id: 'test.ja-jp.', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      { id: 'test.zh.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } },
    ];
    expect(availableLanguageModels(recognizerFiles)).toHaveLength(2);
    expect(availableLanguageModels(recognizerFiles)).toEqual([
      { kind: 'en_intent', name: 'default' },
      { kind: 'multilingual_intent', name: 'default' },
    ]);
  });
});
