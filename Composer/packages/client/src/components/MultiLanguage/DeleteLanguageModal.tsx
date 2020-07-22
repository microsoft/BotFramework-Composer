// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import without from 'lodash/without';
import cloneDeep from 'lodash/cloneDeep';
import { jsx } from '@emotion/core';
import React, { useState, useCallback } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { ScrollablePane, IScrollablePaneStyles } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { Label } from 'office-ui-fabric-react/lib/Label';

import { DialogWrapper, DialogTypes } from '../DialogWrapper';
import { MultiLanguagesDialog } from '../../constants';

import { ILanguageFormData } from './types';
import { classNames } from './styles';
import { languageListTemplatesSorted } from './utils';

export interface IDeleteLanguageModalProps {
  isOpen: boolean;
  languages: string[];
  locale: string;
  defaultLanguage: string;
  onSubmit: (formData: ILanguageFormData) => void;
  onDismiss: () => void;
}

const DeleteLanguageModal: React.FC<IDeleteLanguageModalProps> = (props) => {
  const { languages: currentLanguages, locale, defaultLanguage, isOpen } = props;

  const initialFormData = {
    languages: [],
  };
  const [formData, setFormData] = useState<ILanguageFormData>(initialFormData);

  const onChange = (locale: string) => (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
    const newFormData: ILanguageFormData = cloneDeep(formData);

    if (checked) {
      newFormData.languages.push(locale);
    } else {
      newFormData.languages = without(newFormData.languages, locale);
    }

    setFormData(newFormData);
  };

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      props.onSubmit(formData);
      setFormData(initialFormData);
    },
    [formData]
  );

  const onDismiss = useCallback((e) => {
    e.preventDefault();
    props.onDismiss();
    setFormData(initialFormData);
  }, []);

  const formTitles = { ...MultiLanguagesDialog.DELETE_DIALOG };

  const languageCheckBoxList = languageListTemplatesSorted(currentLanguages, locale, defaultLanguage)
    .filter(({ isEnabled }) => isEnabled)
    .map((item) => {
      const { language, isCurrent, isDefault, locale } = item;
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
          disabled={isDefault || isCurrent}
          label={label}
          title={locale}
          onChange={onChange(locale)}
        />
      );
    });

  const scrollablePaneStyles: Partial<IScrollablePaneStyles> = { root: classNames.pane };

  return (
    <DialogWrapper isOpen={isOpen} onDismiss={onDismiss} {...formTitles} dialogType={DialogTypes.CreateFlow}>
      <form className={classNames.form} onSubmit={onSubmit}>
        <input style={{ display: 'none' }} type="submit" />
        <Stack tokens={{ childrenGap: '3rem' }}>
          <StackItem grow={0}>
            <Label>{MultiLanguagesDialog.ADD_DIALOG.selectionTitle}</Label>
            <ScrollablePane styles={scrollablePaneStyles}>{languageCheckBoxList}</ScrollablePane>
          </StackItem>
          <StackItem>
            <PrimaryButton className={classNames.confirmBtn} text={formatMessage('Done')} onClick={onSubmit} />

            <DefaultButton
              className={classNames.confirmBtn}
              data-testid="DeleteLanguageFormCancel"
              text={formatMessage('Cancel')}
              onClick={onDismiss}
            />
          </StackItem>
        </Stack>
      </form>
    </DialogWrapper>
  );
};

export { DeleteLanguageModal };
