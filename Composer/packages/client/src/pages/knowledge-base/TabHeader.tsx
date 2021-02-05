// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, ReactNode, Fragment } from 'react';
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';

export type TabHeaderProps = {
  locale: string;
  languages: string[];
  onChangeLocale: (locale: string) => void;
  children?: ReactNode;
};
export const TabHeader: React.FC<TabHeaderProps> = (props) => {
  const { locale, languages, onChangeLocale, children } = props;
  const [selectedKey, setSelectedKey] = useState<number>(languages.indexOf(locale) || 0);

  const handleLinkClick = (item?: PivotItem) => {
    if (!item) return;
    const currentLocale = item.props.headerText as string;
    setSelectedKey(languages.indexOf(currentLocale));
    onChangeLocale(currentLocale);
  };
  return (
    <Fragment>
      {languages.length > 1 ? (
        <Pivot aria-label="select locale" selectedKey={String(selectedKey)} onLinkClick={handleLinkClick}>
          {languages.map((l, index) => (
            <PivotItem key={index} headerText={l} itemKey={index.toString()}>
              {children}
            </PivotItem>
          ))}
        </Pivot>
      ) : (
        <div></div>
      )}
    </Fragment>
  );
};
