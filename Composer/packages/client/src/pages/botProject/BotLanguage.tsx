// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { Fragment, useMemo } from 'react';
import { jsx } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import cloneDeep from 'lodash/cloneDeep';

import { dispatcherState, settingsState } from '../../recoilModel';
import { CollapsableWrapper } from '../../components/CollapsableWrapper';
import { languageListTemplates } from '../../components/MultiLanguage';
import { localeState, showAddLanguageModalState } from '../../recoilModel/atoms';
import { AddLanguageModal } from '../../components/MultiLanguage';

import {
  titleStyle,
  appIdAndPasswordStyle,
  botLanguageDescriptionStyle,
  botLanguageFieldStyle,
  languageRowContainer,
  languageTextStyle,
  defaultLanguageTextStyle,
  languageItemContainer,
  languageItem,
  languageButtonContainer,
  languageButton,
  manageBotLanguage,
} from './styles';

type BotLanguageProps = {
  projectId: string;
};

export const BotLanguage: React.FC<BotLanguageProps> = (props) => {
  const { projectId } = props;
  const { languages, defaultLanguage } = useRecoilValue(settingsState(projectId));
  const settings = useRecoilValue(settingsState(projectId));
  const locale = useRecoilValue(localeState(projectId));
  const showAddLanguageModal = useRecoilValue(showAddLanguageModalState(projectId));
  const {
    addLanguageDialogBegin,
    setSettings,
    deleteLanguages,
    setLocale,
    addLanguageDialogCancel,
    addLanguages,
  } = useRecoilValue(dispatcherState);

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

  const onAddLangModalSubmit = async (formData) => {
    await addLanguages({
      ...formData,
      projectId,
    });
  };

  const setDefaultLanguage = (language: string) => {
    setLocale(language, projectId);
    const updatedSetting = { ...cloneDeep(settings), defaultLanguage: language };
    if (updatedSetting?.luis?.defaultLanguage) {
      updatedSetting.luis.defaultLanguage = language;
    }
    setSettings(projectId, updatedSetting);
  };

  const index = languageListOptions.findIndex((l) => l.key === defaultLanguage);
  const dl = languageListOptions.splice(index, 1)[0];
  languageListOptions.unshift(dl);
  return (
    <Fragment>
      <CollapsableWrapper title={formatMessage('Bot Language')} titleStyle={titleStyle}>
        <div css={appIdAndPasswordStyle}>
          <div css={botLanguageDescriptionStyle}>
            {formatMessage(
              'List of languages that bot will be able to understand (User input) and respond to (Bot responses). To make this bot available in other languages, click ‘Manage bot languages’ to create a copy of the default language, and translate the content into the new language.'
            )}
          </div>
          <div css={botLanguageFieldStyle}>
            {languageListOptions.map((l) => (
              <div key={l.key} css={languageRowContainer}>
                {l.key === defaultLanguage && (
                  <Fragment>
                    <div css={languageTextStyle} data-testid={'defaultLanguage'}>
                      {l.text}
                      <span css={defaultLanguageTextStyle}> {formatMessage('DEFAULT LANGUAGE')}</span>
                    </div>
                  </Fragment>
                )}
                {l.key !== defaultLanguage && (
                  <div css={languageItemContainer}>
                    <div css={languageItem}>{l.text}</div>
                    <div css={languageButtonContainer}>
                      <ActionButton
                        data-testid={'setDefaultLanguage'}
                        styles={languageButton}
                        onClick={(e) => setDefaultLanguage(l.key)}
                      >
                        {formatMessage('Set it as default language')}
                      </ActionButton>
                      <ActionButton
                        data-testid={'remove'}
                        styles={languageButton}
                        onClick={() => deleteLanguages({ languages: [l.key], projectId: projectId })}
                      >
                        {formatMessage('Remove')}
                      </ActionButton>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <ActionButton styles={manageBotLanguage} onClick={() => addLanguageDialogBegin(projectId, () => {})}>
            {formatMessage('Manage bot languages')}
          </ActionButton>
        </div>
      </CollapsableWrapper>
      <AddLanguageModal
        defaultLanguage={defaultLanguage}
        isOpen={showAddLanguageModal}
        languages={languages}
        locale={locale}
        onDismiss={() => addLanguageDialogCancel(projectId)}
        onSubmit={onAddLangModalSubmit}
      />
    </Fragment>
  );
};
