// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, ReactNode, useMemo } from 'react';
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';

import { languageListTemplates } from '../../components/MultiLanguage';

export type TabHeaderProps = {
  locale: string;
  defaultLanguage: string;
  languages: string[];
  onChangeLocale: (locale: string) => void;
  children?: ReactNode;
};
export const TabHeader: React.FC<TabHeaderProps> = (props) => {
  const { locale, defaultLanguage, languages, onChangeLocale, children } = props;
  const languageList = useMemo(() => {
    const langs = languages.filter((l) => l !== defaultLanguage).concat(defaultLanguage);
    return languageListTemplates(langs, locale, defaultLanguage).filter((l) => l.isEnabled);
  }, languages);
  const [selectedKey, setSelectedKey] = useState<number>(languageList.findIndex((l) => l.locale === locale) || 0);

  const handleLinkClick = (item?: PivotItem) => {
    if (!item) return;
    const currentLocale = languageList.find(
      (l) =>
        (!l.isDefault && l.language === item.props.headerText) ||
        (l.isDefault && `${l.language}(Default)` === item.props.headerText)
    )?.locale as string;
    setSelectedKey(languageList.findIndex((l) => l.locale === currentLocale));
    onChangeLocale(currentLocale);
  };
  return (
    <Pivot
      aria-label="select locale"
      selectedKey={String(selectedKey)}
      style={{ height: '100%' }}
      styles={{ itemContainer: { height: 'calc(100% - 60px)', marginTop: '10px' } }}
      onLinkClick={handleLinkClick}
    >
      {languageList.map((l, index) => (
        <PivotItem
          key={index}
          headerText={`${l.language}${l.isDefault ? '(Default)' : ''}`}
          itemKey={index.toString()}
          style={{ height: '100%' }}
        >
          {children}
        </PivotItem>
      ))}
    </Pivot>
  );
};
