// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, ReactNode, useMemo } from 'react';
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';

import { languageListTemplates, LanguageTemplate } from '../../components/MultiLanguage';

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
    const languageTemplates = languageListTemplates(languages, locale, defaultLanguage).filter((l) => l.isEnabled);
    const defaultLanguageTemplate = languageTemplates.find((l) => l.locale === defaultLanguage) as LanguageTemplate;
    return [...languageTemplates.filter((l) => l.locale !== defaultLanguage), defaultLanguageTemplate];
  }, [languages]);
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
      style={{ height: '100%', overflow: 'auto' }}
      styles={{
        root: {
          position: 'absolute',
          left: '20px',
          top: '0px',
          width: 'calc(100% - 40px)',
          zIndex: 1,
          backgroundColor: 'white',
        },
        itemContainer: { height: 'calc(100% - 60px)', marginTop: '60px', padding: '0 20px' },
      }}
      onLinkClick={handleLinkClick}
    >
      {languageList.map((l) => (
        <PivotItem
          key={l.language}
          headerText={`${l.language}${l.isDefault ? '(Default)' : ''}`}
          itemKey={l.language.toString()}
          style={{ height: '100%' }}
        >
          {children}
        </PivotItem>
      ))}
    </Pivot>
  );
};
