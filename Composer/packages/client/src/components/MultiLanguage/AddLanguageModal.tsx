// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import without from 'lodash/without';
import cloneDeep from 'lodash/cloneDeep';
import { jsx } from '@emotion/core';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import { ScrollablePane, IScrollablePaneStyles } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';

import { DialogWrapper, DialogTypes } from '../DialogWrapper';
import { MultiLanguagesDialog } from '../../constants';

import { ILanguageFormData } from './types';
import { classNames } from './styles';
import { languageListTemplatesSorted, languageListTemplates } from './utils';

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

  const onDismiss = useCallback((e) => {
    e.preventDefault();
    setFormData(initialFormData);
    props.onDismiss();
  }, []);

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
        <Checkbox
          key={locale}
          className={classNames.checkboxItem}
          defaultChecked={isEnabled}
          disabled={isEnabled}
          label={label}
          title={locale}
          onChange={onChange(locale)}
        />
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
              disabled={defalutLanguageListOptions.length === 1}
              options={defalutLanguageListOptions}
              placeholder="Select an option"
              selectedKey={formData.defaultLang}
              styles={{ dropdown: { width: 300, marginTop: 10 } }}
              onChange={onDefaultLanguageChange}
            />
          </StackItem>
          <StackItem grow={0}>
            <Label>{MultiLanguagesDialog.ADD_DIALOG.selectionTitle}</Label>
            <SearchBox
              disableAnimation
              placeholder={MultiLanguagesDialog.ADD_DIALOG.searchPlaceHolder}
              styles={{ root: { width: 300 } }}
              onChange={onSearch}
            />
            <ScrollablePane styles={scrollablePaneStyles}>{languageCheckBoxList}</ScrollablePane>
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
