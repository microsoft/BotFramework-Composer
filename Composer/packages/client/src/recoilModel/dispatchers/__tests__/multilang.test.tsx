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
  currentProjectIdState,
} from '../../atoms';
import { dispatcherState } from '../../../recoilModel/DispatcherWrapper';
import { Dispatcher } from '..';
import { multilangDispatcher } from '../multilang';
import { botStateByProjectIdSelector } from '../../selectors';

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
  projectId: '1234-abcd',
};

describe('Multilang dispatcher', () => {
  let renderedComponent, dispatcher: Dispatcher;
  beforeEach(() => {
    const useRecoilTestHook = () => {
      const {
        actionsSeed,
        dialogs,
        locale,
        dialogSetting: settings,
        luFiles,
        lgFiles,
        onAddLanguageDialogComplete,
        onDelLanguageDialogComplete,
      } = useRecoilValue(botStateByProjectIdSelector);

      const currentDispatcher = useRecoilValue(dispatcherState);
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
        { recoilState: currentProjectIdState, initialValue: state.projectId },
        { recoilState: dialogsState(state.projectId), initialValue: state.dialogs },
        { recoilState: localeState(state.projectId), initialValue: state.locale },
        { recoilState: lgFilesState(state.projectId), initialValue: state.lgFiles },
        { recoilState: luFilesState(state.projectId), initialValue: state.luFiles },
        { recoilState: settingsState(state.projectId), initialValue: state.settings },
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
        projectId: state.projectId,
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
        projectId: state.projectId,
      });
    });
    expect(renderedComponent.current.settings.languages).toEqual(['en-us']);
    expect(renderedComponent.current.lgFiles.length).toEqual(1);
    expect(renderedComponent.current.luFiles.length).toEqual(1);
  });

  it('set locale', async () => {
    await act(async () => {
      await dispatcher.setLocale('fr-fr', state.projectId);
    });
    expect(renderedComponent.current.locale).toEqual('fr-fr');
  });
});
