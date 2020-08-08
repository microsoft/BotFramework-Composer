// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { JsonEditor } from '@bfc/code-editor';
import formatMessage from 'format-message';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { RouteComponentProps } from '@reach/router';
import { useRecoilValue } from 'recoil';
import React, { useMemo, useEffect } from 'react';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import cloneDeep from 'lodash/cloneDeep';
import { Label } from 'office-ui-fabric-react/lib/Label';

import {
  botNameState,
  settingsState,
  projectIdState,
  dispatcherState,
  userSettingsState,
  localeState,
} from '../../../recoilModel';
import { languageListTemplates } from '../../../components/MultiLanguage';
import { navigateTo } from '../../../utils/navigation';

import { settingsEditor, toolbar } from './style';
import { BotSettings } from './constants';

export const DialogSettings: React.FC<RouteComponentProps> = () => {
  const botName = useRecoilValue(botNameState);
  const locale = useRecoilValue(localeState);
  const settings = useRecoilValue(settingsState);
  const projectId = useRecoilValue(projectIdState);
  const userSettings = useRecoilValue(userSettingsState);
  const { setSettings, setLocale, addLanguageDialogBegin } = useRecoilValue(dispatcherState);

  const { languages, defaultLanguage } = settings;
  useEffect(() => {
    if (!botName) navigateTo('/home');
  }, [botName]);

  const saveChangeResult = (result) => {
    try {
      setSettings(projectId, result);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err.message);
    }
  };

  const handleChange = (result: any) => {
    // prevent result was undefined, it will cause error
    if (result && typeof result === 'object') {
      saveChangeResult(result);
    }
  };

  const onDefaultLanguageChange = (
    _event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption,
    _index?: number
  ) => {
    const selectedLang = option?.key as string;
    if (selectedLang && selectedLang !== defaultLanguage) {
      setLocale(selectedLang);
      const updatedSetting = { ...cloneDeep(settings), defaultLanguage: selectedLang };
      if (updatedSetting?.luis?.defaultLanguage) {
        updatedSetting.luis.defaultLanguage = selectedLang;
      }
      saveChangeResult(updatedSetting);
    }
  };

  const onLanguageChange = (_event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, _index?: number) => {
    const selectedLang = option?.key as string;
    if (selectedLang && selectedLang !== locale) {
      setLocale(selectedLang);
    }
  };

  const languageListOptions = useMemo(() => {
    const languageList = languageListTemplates(languages, locale, defaultLanguage);
    const enableLanguages = languageList.filter(({ isEnabled }) => !!isEnabled);
    return enableLanguages.map((item) => {
      const { language, locale } = item;
      return {
        key: locale,
        title: locale,
        text: language,
      };
    });
  }, [languages]);

  const editorId = [defaultLanguage, ...languages].join('-');

  return botName ? (
    <Stack tokens={{ childrenGap: '1rem' }}>
      <StackItem grow={0}>
        <Label>{BotSettings.generalTitle}</Label>
        <section>
          {BotSettings.botSettingDescription}
          &nbsp;
          <Link href={'https://aka.ms/bf-composer-docs-publish-bot'} target="_blank">
            {BotSettings.learnMore}
          </Link>
        </section>
      </StackItem>
      <StackItem>
        <Label>{BotSettings.languageTitle}</Label>
        <section>{BotSettings.languagesubTitle}</section>
        <section style={{ padding: '0 50px' }}>
          <div css={toolbar}>
            <Dropdown
              disabled={languageListOptions.length === 1}
              label={BotSettings.languageBotLanauge}
              options={languageListOptions}
              placeholder="Select an option"
              selectedKey={locale}
              styles={{ dropdown: { width: 300 } }}
              onChange={onLanguageChange}
            />

            <Link
              onClick={() => {
                addLanguageDialogBegin(() => {});
              }}
            >
              {BotSettings.languageAddLanauge}
            </Link>
          </div>

          <Dropdown
            disabled={languageListOptions.length === 1}
            label={BotSettings.languageDefaultLanauge}
            options={languageListOptions}
            placeholder="Select an option"
            selectedKey={defaultLanguage}
            styles={{ dropdown: { width: 300 } }}
            onChange={onDefaultLanguageChange}
          />
        </section>
      </StackItem>
      <StackItem>
        <div css={settingsEditor}>
          <JsonEditor editorSettings={userSettings.codeEditor} id={editorId} value={settings} onChange={handleChange} />
        </div>
      </StackItem>
    </Stack>
  ) : (
    <div>{formatMessage('Data loading...')}</div>
  );
};
