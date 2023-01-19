// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import without from 'lodash/without';
import cloneDeep from 'lodash/cloneDeep';
import { jsx } from '@emotion/react';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { SearchBox } from '@fluentui/react/lib/SearchBox';
import { ScrollablePane, IScrollablePaneStyles } from '@fluentui/react/lib/ScrollablePane';
import { Stack, StackItem } from '@fluentui/react/lib/Stack';
import { Checkbox } from '@fluentui/react/lib/Checkbox';
import { Label } from '@fluentui/react/lib/Label';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { hiddenContentStyle, mergeStyles } from '@fluentui/react/lib/Styling';
import { Announced } from '@fluentui/react/lib/Announced';
import { useId } from '@fluentui/react-hooks';
import { FocusZoneDirection, FocusZone } from '@fluentui/react/lib/FocusZone';

import { MultiLanguagesDialog } from '../../constants';

import { ILanguageFormData } from './types';
import { classNames } from './styles';
import { languageListTemplatesSorted, languageListTemplates } from './utils';

const screenReaderOnly = mergeStyles(hiddenContentStyle);

export interface IAddLanguageModalProps {
  isOpen: boolean;
  languages: string[];
  locale: string;
  defaultLanguage: string;
  onSubmit: (formData: ILanguageFormData) => void;
  onDismiss: () => void;
}

const AddLanguageModal: React.FC<IAddLanguageModalProps> = (props) => {
  const { languages: currentLanguages, locale, defaultLanguage, isOpen } = props;

  const initialFormData = {
    languages: [],
    defaultLang: defaultLanguage,
    switchTo: false,
  };
  const [formData, setFormData] = useState<ILanguageFormData>(initialFormData);
  const [searchKeywords, setSearchKeywords] = useState('');

  useEffect(() => {
    setFormData({ ...formData, defaultLang: defaultLanguage });
  }, [defaultLanguage]);

  const onChange = (locale: string) => (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
    const newFormData: ILanguageFormData = cloneDeep(formData);

    if (checked) {
      newFormData.languages.push(locale);
    } else {
      newFormData.languages = without(newFormData.languages, locale);
    }

    setFormData(newFormData);
  };

  const onDefaultLanguageChange = (
    _event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption,
    _index?: number
  ) => {
    const selectedLang = option?.key as string;
    if (selectedLang && selectedLang !== formData.defaultLang) {
      setFormData({ ...formData, defaultLang: selectedLang });
    }
  };

  const onCheckSwitch = (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
    const newFormData: ILanguageFormData = cloneDeep(formData);
    if (checked) {
      newFormData.switchTo = true;
    } else {
      newFormData.switchTo = false;
    }
    setFormData(newFormData);
  };

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setFormData(initialFormData);
      props.onSubmit(formData);
    },
    [formData]
  );

  const onDismiss = (e) => {
    e.preventDefault();
    setFormData(initialFormData);
    props.onDismiss();
  };

  const formTitles = { ...MultiLanguagesDialog.ADD_DIALOG };

  const languageCheckBoxList = languageListTemplatesSorted(currentLanguages, locale, defaultLanguage)
    .filter((item) => item.language.toLowerCase().includes(searchKeywords.toLowerCase()))
    .map((item) => {
      const { language, isEnabled, isCurrent, isDefault, locale } = item;
      let label = language;
      if (isDefault) {
        label += formatMessage(' - Original');
      }
      if (isCurrent) {
        label += formatMessage(' - Current');
      }
      return (
        <div key={locale} role="listitem">
          <Checkbox
            className={classNames.checkboxItem}
            defaultChecked={isEnabled}
            disabled={isEnabled}
            label={label}
            title={locale}
            onChange={onChange(locale)}
          />
        </div>
      );
    });

  const defalutLanguageListOptions = useMemo(() => {
    const languageList = languageListTemplates(currentLanguages, locale, defaultLanguage);
    const enableLanguages = languageList.filter(({ isEnabled }) => !!isEnabled);
    return enableLanguages.map((item) => {
      const { language, locale } = item;
      return {
        key: locale,
        title: locale,
        text: language,
      };
    });
  }, [currentLanguages]);

  const searchBoxLabelId = useId('search-box-label');
  const searchBoxId = useId('search-box');
  const translationsLabelId = useId('translations-label');

  const onSearch = (_e, newValue) => {
    setSearchKeywords(newValue.trim());
  };

  const scrollablePaneStyles: Partial<IScrollablePaneStyles> = { root: classNames.pane };

  return (
    <DialogWrapper isOpen={isOpen} onDismiss={onDismiss} {...formTitles} dialogType={DialogTypes.CreateFlow}>
      <form className={classNames.form} onSubmit={onSubmit}>
        <input style={{ display: 'none' }} type="submit" />
        <Stack tokens={{ childrenGap: '3rem' }}>
          <StackItem grow={0}>
            <Label>{MultiLanguagesDialog.ADD_DIALOG.selectDefaultLangTitle}</Label>
            <Dropdown
              ariaLabel={formatMessage('Default language')}
              disabled={defalutLanguageListOptions.length === 1}
              options={defalutLanguageListOptions}
              placeholder="Select an option"
              selectedKey={formData.defaultLang}
              styles={{ dropdown: { maxWidth: 300, marginTop: 10 } }}
              onChange={onDefaultLanguageChange}
            />
          </StackItem>
          <StackItem aria-labelledby={translationsLabelId} grow={0}>
            <div id={translationsLabelId}>
              <div className={screenReaderOnly}>{formatMessage('Bot language translations')}</div>
              <Announced
                message={formatMessage(
                  `{
                    hasFilter, select,
                      false {}
                      other {Search results for "{searchKeywords}":}
                  } {
                    languagesCount, plural,
                      =1 {one language found}
                      =0 {no languages found}
                      other {# languages found}
                  }
              `,
                  { searchKeywords, hasFilter: !!searchKeywords, languagesCount: languageCheckBoxList.length }
                )}
              />
              <Announced
                message={formatMessage(
                  `{
                    languagesCount, plural,
                      =0 {No languages selected}
                      =1 {One language selected}
                      other {# languages selected}
                  }`,
                  { languagesCount: formData.languages.length }
                )}
              />
              <div className={screenReaderOnly}>
                {formatMessage('Press tab then up and down arrow keys to navigate the search results')}
              </div>
            </div>
            <Label htmlFor={searchBoxId} id={searchBoxLabelId}>
              {MultiLanguagesDialog.ADD_DIALOG.selectionTitle}
            </Label>
            <SearchBox
              disableAnimation
              aria-labelledby={searchBoxLabelId}
              id={searchBoxId}
              placeholder={MultiLanguagesDialog.ADD_DIALOG.searchPlaceHolder}
              styles={{ root: { maxWidth: 300, width: 'auto' } }}
              onChange={onSearch}
            />
            <FocusZone direction={FocusZoneDirection.vertical}>
              <ScrollablePane styles={scrollablePaneStyles}>
                <div role="list">{languageCheckBoxList}</div>
              </ScrollablePane>
            </FocusZone>
          </StackItem>
          <StackItem>
            <Checkbox
              key={'switchTo'}
              className={classNames.checkboxSwitchToNew}
              label={MultiLanguagesDialog.ADD_DIALOG.whenDoneText}
              onChange={onCheckSwitch}
            />
          </StackItem>
          <StackItem>
            <PrimaryButton className={classNames.confirmBtn} text={formatMessage('Done')} onClick={onSubmit} />

            <DefaultButton
              className={classNames.confirmBtn}
              data-testid="AddLanguageFormCancel"
              text={formatMessage('Cancel')}
              onClick={onDismiss}
            />
          </StackItem>
        </Stack>
      </form>
    </DialogWrapper>
  );
};

export { AddLanguageModal };
