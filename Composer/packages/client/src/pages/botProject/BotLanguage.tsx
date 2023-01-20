// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { Fragment, useMemo } from 'react';
import { jsx, css } from '@emotion/react';
import { useRecoilValue } from 'recoil';
import { ActionButton } from '@fluentui/react/lib/Button';
import formatMessage from 'format-message';
import cloneDeep from 'lodash/cloneDeep';
import {
  getFocusStyle,
  FontSizes,
  FontWeights,
  mergeStyles,
  hiddenContentStyle,
  getTheme,
} from '@fluentui/react/lib/Styling';
import { NeutralColors, SharedColors } from '@fluentui/theme';
import { useId } from '@fluentui/react-hooks';

import { dispatcherState, settingsState } from '../../recoilModel';
import { languageListTemplates } from '../../components/MultiLanguage';
import { localeState, showAddLanguageModalState } from '../../recoilModel/atoms';
import { AddLanguageModal } from '../../components/MultiLanguage';
import { mergePropertiesManagedByRootBot } from '../../recoilModel/dispatchers/utils/project';
import { rootBotProjectIdSelector } from '../../recoilModel/selectors/project';

import { headerText } from './styles';
// -------------------- Styles -------------------- //

const botLanguageContainerStyle = css`
  display: flex;
  flex-direction: column;
`;

const botLanguageFieldStyle = css`
  font-size: ${FontSizes.small};
  color: ${NeutralColors.black};
  overflow-y: auto;
  max-height: 150px;
  border: 1px solid #c4c4c4;
  margin-top: 17px;
  padding: 10px;
`;

const manageBotLanguage = {
  root: {
    height: 30,
    fontSize: FontSizes.smallPlus,
    fontWeight: FontWeights.regular,
    color: SharedColors.cyanBlue10,
    paddingLeft: 0,
  },
};

const languageItem = css`
  &:hover {
    background: #ebebeb;
  }
`;

const languageRowContainer = css`
  display: flex;
  height: 30px;
  line-height: 30px;
  &:hover .ms-Button,
  &:focus .ms-Button,
  &:focus-within .ms-Button {
    visibility: visible;
  }
`;

const languageItemContainer = css`
  display: flex;
  width: 100%;
  justify-content: space-between;
`;

const languageButton = {
  root: {
    fontSize: FontSizes.small,
    fontWeight: FontWeights.regular,
    color: SharedColors.cyanBlue10,
    height: 30,
    visibility: 'hidden',
  },
};

const defaultLanguageTextStyle = css`
  color: #595959;
  font-size: 8px;
`;

const languageTextStyle = css`
  color: ${NeutralColors.black};
  font-size: 12px;
`;

const languageButtonContainer = css`
  display: flex;
  justify-content: space-between;
  width: 240px;
`;

const screenReaderOnlyClassName = mergeStyles(hiddenContentStyle);

const focusClassName = mergeStyles(getFocusStyle(getTheme(), { inset: -3 }));

// -------------------- BotLanguage -------------------- //

type BotLanguageProps = {
  projectId: string;
};

export const BotLanguage: React.FC<BotLanguageProps> = (props) => {
  const { projectId } = props;
  const { languages, defaultLanguage } = useRecoilValue(settingsState(projectId));
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector) || '';
  const settings = useRecoilValue(settingsState(projectId));
  const mergedSettings = mergePropertiesManagedByRootBot(projectId, rootBotProjectId, settings);
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
    const updatedSetting = { ...cloneDeep(mergedSettings), defaultLanguage: language };
    if (updatedSetting?.luis?.defaultLanguage) {
      updatedSetting.luis.defaultLanguage = language;
    }
    setSettings(projectId, updatedSetting);
  };

  const index = languageListOptions.findIndex((l) => l.key === defaultLanguage);
  const dl = languageListOptions.splice(index, 1)[0];
  languageListOptions.unshift(dl);

  const languageRowAriaId = useId('language-row-aria-');

  return (
    <Fragment>
      <div css={botLanguageContainerStyle}>
        <div css={headerText}>
          {formatMessage(
            'List of languages that bot will be able to understand (User input) and respond to (Bot responses). To make this bot available in other languages, click ‘Manage languages’ to create a copy of the default language, and translate the content into the new language.'
          )}
        </div>
        <div
          aria-label={formatMessage('List of languages that bot will be able to understand and respond to')}
          css={botLanguageFieldStyle}
          role="list"
        >
          {languageListOptions.map((l) => (
            <div
              key={l.key}
              aria-labelledby={`${languageRowAriaId}-${l.key}`}
              className={focusClassName}
              css={languageRowContainer}
              role="listitem"
              // Needed for keyboard navigation
              // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
              tabIndex={0}
            >
              {l.key === defaultLanguage && (
                <div css={languageTextStyle} data-testid={'defaultLanguage'} id={`${languageRowAriaId}-${l.key}`}>
                  {l.text}
                  <span css={defaultLanguageTextStyle}> {formatMessage('DEFAULT LANGUAGE')}</span>
                </div>
              )}
              {l.key !== defaultLanguage && (
                <div css={languageItemContainer}>
                  <div css={languageItem} id={`${languageRowAriaId}-${l.key}`}>
                    {l.text} <span className={screenReaderOnlyClassName}>{formatMessage('Language')}</span>
                  </div>
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
