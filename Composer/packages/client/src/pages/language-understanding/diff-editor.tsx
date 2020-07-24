// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable react/display-name */
/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useMemo } from 'react';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';

import { languageListTemplates } from '../../components/MultiLanguage';

import { diffEditorContainer, diffEditorRight, editorToolbar, diffEditorContent, dropdown } from './styles';

interface DiffCodeEditorProps {
  locale: string;
  defaultLanguage: string;
  languages: string[];
  left: JSX.Element;
  right: JSX.Element;
  onLanguageChange: (lang) => void;
}

const DiffCodeEditor: React.FC<DiffCodeEditorProps> = (props) => {
  const { onLanguageChange, locale, defaultLanguage, languages, left: leftEditor, right: rightEditor } = props;

  const languageList = languageListTemplates(languages, locale, defaultLanguage);

  const onLanguageSelectChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number) => {
    const selectedLang = option?.key;
    if (selectedLang && selectedLang !== locale) {
      onLanguageChange(selectedLang);
    }
  };

  const languageListOptionsLeft: IDropdownOption[] = useMemo(() => {
    const enableLanguages = languageList.filter(({ isDefault, isEnabled }) => !isDefault && isEnabled);
    return enableLanguages.map((item) => {
      const { language, locale } = item;
      return {
        key: locale,
        text: language,
      };
    });
  }, [languages]);

  const languageListOptionsRight: IDropdownOption[] = useMemo(() => {
    const enableLanguages = languageList.filter(({ isDefault }) => !!isDefault);
    return enableLanguages.map((item) => {
      const { language, locale } = item;
      return {
        key: locale,
        text: language,
      };
    });
  }, [languages]);

  return (
    <div css={diffEditorContainer}>
      <div>
        <div css={editorToolbar}>
          <Dropdown
            options={languageListOptionsLeft}
            selectedKey={locale}
            styles={dropdown}
            onChange={onLanguageSelectChange}
          />
        </div>
        <div css={diffEditorContent}>{leftEditor}</div>
      </div>
      <div css={diffEditorRight}>
        <div css={editorToolbar}>
          <Dropdown disabled options={languageListOptionsRight} selectedKey={defaultLanguage} styles={dropdown} />
        </div>
        <div css={diffEditorContent}>{rightEditor}</div>
      </div>
    </div>
  );
};

export { DiffCodeEditor };
