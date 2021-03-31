// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React, { Fragment, useMemo } from 'react';
import { jsx, css } from '@emotion/core';
import { useRecoilValue } from 'recoil';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import cloneDeep from 'lodash/cloneDeep';
import { FontSizes, FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { NeutralColors, SharedColors } from '@uifabric/fluent-theme';

import { dispatcherState, settingsState } from '../../recoilModel';
import { CollapsableWrapper } from '../../components/CollapsableWrapper';
import { languageListTemplates } from '../../components/MultiLanguage';
import { localeState, showAddLanguageModalState } from '../../recoilModel/atoms';
import { AddLanguageModal } from '../../components/MultiLanguage';
import { mergePropertiesManagedByRootBot } from '../../recoilModel/dispatchers/utils/project';
import { rootBotProjectIdSelector } from '../../recoilModel/selectors/project';

import { title, subtitle } from './styles';
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
`;

const languageItemContainer = css`
  display: flex;
  width: 100%;
  justify-content: space-between;
  &:hover .ms-Button {
    visibility: visible;
  }
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

  return (
    <Fragment>
      <CollapsableWrapper title={formatMessage('Bot language')} titleStyle={title}>
        <div css={botLanguageContainerStyle}>
          <div css={subtitle}>
            {formatMessage(
              'List of languages that bot will be able to understand (User input) and respond to (Bot responses). To make this bot available in other languages, click ‘Manage bot languages’ to create a copy of the default language, and translate the content into the new language.'
            )}
          </div>
          <div css={botLanguageFieldStyle}>
            {languageListOptions.map((l) => (
              <div key={l.key} css={languageRowContainer}>
                {l.key === defaultLanguage && (
                  <div css={languageTextStyle} data-testid={'defaultLanguage'}>
                    {l.text}
                    <span css={defaultLanguageTextStyle}> {formatMessage('DEFAULT LANGUAGE')}</span>
                  </div>
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
