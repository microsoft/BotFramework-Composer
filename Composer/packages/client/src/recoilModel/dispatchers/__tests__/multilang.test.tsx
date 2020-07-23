// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';
import { act } from '@bfc/test-utils/lib/hooks';

import { renderRecoilHook } from '../../../../__tests__/testUtils';
import {
  luFilesState,
  lgFilesState,
  settingsState,
  dialogsState,
  localeState,
  onAddLanguageDialogCompleteState,
  onDelLanguageDialogCompleteState,
  actionsSeedState,
} from '../../atoms';
import { dispatcherState } from '../../../recoilModel/DispatcherWrapper';
import { Dispatcher } from '..';
import { multilangDispatcher } from '../multilang';

const state = {
  dialogs: [{ id: '1' }, { id: '2' }],
  locale: 'en-us',
  lgFiles: [
    { id: 'a.en-us', content: 'hi' },
    { id: 'a.fr-fr', content: 'hi' },
  ],
  luFiles: [
    { id: 'a.en-us', content: 'hi' },
    { id: 'a.fr-fr', content: 'hi' },
  ],
  settings: {
    defaultLanguage: 'en-us',
    languages: ['en-us', 'fr-fr'],
  },
};

describe('Multilang dispatcher', () => {
  let renderedComponent, dispatcher: Dispatcher;
  beforeEach(() => {
    const useRecoilTestHook = () => {
      const dialogs = useRecoilValue(dialogsState);
      const locale = useRecoilValue(localeState);
      const settings = useRecoilValue(settingsState);
      const luFiles = useRecoilValue(luFilesState);
      const lgFiles = useRecoilValue(lgFilesState);
      const currentDispatcher = useRecoilValue(dispatcherState);
      const actionsSeed = useRecoilValue(actionsSeedState);
      const onAddLanguageDialogComplete = useRecoilValue(onAddLanguageDialogCompleteState);
      const onDelLanguageDialogComplete = useRecoilValue(onDelLanguageDialogCompleteState);

      return {
        dialogs,
        locale,
        settings,
        luFiles,
        lgFiles,
        currentDispatcher,
        actionsSeed,
        onAddLanguageDialogComplete,
        onDelLanguageDialogComplete,
      };
    };

    const { result } = renderRecoilHook(useRecoilTestHook, {
      states: [
        { recoilState: dialogsState, initialValue: state.dialogs },
        { recoilState: localeState, initialValue: state.locale },
        { recoilState: lgFilesState, initialValue: state.lgFiles },
        { recoilState: luFilesState, initialValue: state.luFiles },
        { recoilState: settingsState, initialValue: state.settings },
      ],
      dispatcher: {
        recoilState: dispatcherState,
        initialValue: {
          multilangDispatcher,
        },
      },
    });
    renderedComponent = result;
    dispatcher = renderedComponent.current.currentDispatcher;
  });

  it('add language', async () => {
    await act(async () => {
      await dispatcher.addLanguages({
        languages: ['zh-cn'],
        defaultLang: 'en-us',
        switchTo: true,
      });
    });
    expect(renderedComponent.current.settings.languages).toEqual(['en-us', 'fr-fr', 'zh-cn']);
    expect(renderedComponent.current.lgFiles.length).toEqual(3);
    expect(renderedComponent.current.lgFiles[2]).toEqual({ id: 'a.zh-cn', content: 'hi' });
    expect(renderedComponent.current.luFiles.length).toEqual(3);
    expect(renderedComponent.current.luFiles[2]).toEqual({ id: 'a.zh-cn', content: 'hi' });
    expect(renderedComponent.current.locale).toEqual('zh-cn');
  });

  it('delete language', async () => {
    await act(async () => {
      await dispatcher.deleteLanguages({
        languages: ['fr-fr'],
      });
    });
    expect(renderedComponent.current.settings.languages).toEqual(['en-us']);
    expect(renderedComponent.current.lgFiles.length).toEqual(1);
    expect(renderedComponent.current.luFiles.length).toEqual(1);
  });

  it('set locale', async () => {
    await act(async () => {
      await dispatcher.setLocale('fr-fr');
    });
    expect(renderedComponent.current.locale).toEqual('fr-fr');
  });
});
