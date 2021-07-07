// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RecognizerFile, SDKKinds } from '@bfc/shared';

import httpClient from '../../../utils/httpUtil';
import { getAvailableLanguageModels } from '../orchestrator';

describe('Orchestrator model picking logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('no language returned if empty or invalid id, or non-orchestrator recognizer', async () => {
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
    expect(await getAvailableLanguageModels(recognizerFiles)).toHaveLength(0);
    expect(await getAvailableLanguageModels([])).toHaveLength(0);
  });

  it('return en model only once', async () => {
    const recognizerFiles: RecognizerFile[] = [
      { id: 'test.zh-cn.dialog', content: { $kind: SDKKinds.LuisRecognizer } },
      { id: 'test.en.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      { id: 'test.EN.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      { id: 'test.en-us.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      { id: 'test.en-sg.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } },
    ];
    expect(await getAvailableLanguageModels(recognizerFiles)).toHaveLength(1);
    expect(await getAvailableLanguageModels(recognizerFiles)).toEqual([{ kind: 'en_intent', name: 'default' }]);
  });

  it('return en model under correct circumstances', async () => {
    const enModel = { kind: 'en_intent', name: 'default' };
    expect(
      await getAvailableLanguageModels([
        { id: 'test.en-us.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      ])
    ).toEqual([enModel]);
    expect(
      await getAvailableLanguageModels([
        { id: 'test.EN-us.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      ])
    ).toEqual([enModel]);
    expect(
      await getAvailableLanguageModels([
        { id: 'test.en-US.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      ])
    ).toEqual([enModel]);
    expect(
      await getAvailableLanguageModels([{ id: 'test.en.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } }])
    ).toEqual([enModel]);
    expect(
      await getAvailableLanguageModels([
        { id: 'test.en-anything.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      ])
    ).toEqual([enModel]);
  });

  it('return multilang model under correct circumstances', async () => {
    const multilingualModel = { kind: 'multilingual_intent', name: 'default' };
    expect(
      await getAvailableLanguageModels([{ id: 'test.it.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } }])
    ).toEqual([multilingualModel]);
    expect(
      await getAvailableLanguageModels([{ id: 'test.jp.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } }])
    ).toHaveLength(0);
    expect(
      await getAvailableLanguageModels([{ id: 'test.ja.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } }])
    ).toHaveLength(1);

    expect(
      await getAvailableLanguageModels([
        { id: 'test.zh-cn.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      ])
    ).toEqual([multilingualModel]);
    expect(
      await getAvailableLanguageModels([
        { id: 'test.zh-CN.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      ])
    ).toEqual([multilingualModel]);
    expect(
      await getAvailableLanguageModels([
        { id: 'test.rwk-tz.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      ])
    ).toEqual([multilingualModel]);
    expect(
      await getAvailableLanguageModels([{ id: 'test.pap', content: { $kind: SDKKinds.OrchestratorRecognizer } }])
    ).toEqual([multilingualModel]);
    expect(
      await getAvailableLanguageModels([{ id: 'test.tr-cy', content: { $kind: SDKKinds.OrchestratorRecognizer } }])
    ).toEqual([multilingualModel]);
    expect(
      await getAvailableLanguageModels([{ id: 'test.nope', content: { $kind: SDKKinds.OrchestratorRecognizer } }])
    ).toHaveLength(0);
  });

  it('return all models when multiple languages are detected', async () => {
    const recognizerFiles: RecognizerFile[] = [
      { id: 'test.en-us.', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      { id: 'test.en.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      { id: 'test.fr-be.', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      { id: 'test.ja-jp.', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      { id: 'test.zh.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } },
    ];
    expect(await getAvailableLanguageModels(recognizerFiles)).toHaveLength(2);
    expect(await getAvailableLanguageModels(recognizerFiles)).toEqual([
      { kind: 'en_intent', name: 'default' },
      { kind: 'multilingual_intent', name: 'default' },
    ]);
  });

  it('return proper model names instead of default after checking against Orchestrator model list', async () => {
    const recognizerFiles: RecognizerFile[] = [
      { id: 'test.en-us.', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      { id: 'test.en.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      { id: 'test.fr-be.', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      { id: 'test.ja-jp.', content: { $kind: SDKKinds.OrchestratorRecognizer } },
      { id: 'test.zh.dialog', content: { $kind: SDKKinds.OrchestratorRecognizer } },
    ];

    (httpClient.get as jest.Mock).mockResolvedValueOnce({
      data: {
        defaults: {
          en_intent: 'fake_english_model_name', // eslint-disable-line @typescript-eslint/camelcase
          multilingual_intent: 'fake_multilingual_model_name', // eslint-disable-line @typescript-eslint/camelcase
        },
      },
    });

    expect(await getAvailableLanguageModels(recognizerFiles)).toEqual([
      { kind: 'en_intent', name: 'fake_english_model_name' },
      { kind: 'multilingual_intent', name: 'fake_multilingual_model_name' },
    ]);
  });
});
