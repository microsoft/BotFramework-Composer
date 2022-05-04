// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React from 'react';
import { CompletionItem } from 'vscode-languageserver-types';
import { css, jsx } from '@emotion/react';

import { CompletionElement } from './CompletionElement';

const styles = {
  completionList: css`
    position: absolute;
    top: 32px;
    left: 0;
    max-height: 300px;
    width: 100%;
    background-color: white;
    overflow-y: auto;
    overflow-x: hidden;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    z-index: 2000;
  `,
};

export const CompletionList = React.forwardRef<
  HTMLDivElement,
  {
    completionItems: CompletionItem[];
    getItemId: (index: number) => string;
    selectedItem: number;
    completionListOverride?: JSX.Element | null;
    onClickCompletionItem: (index: number) => void;
    'aria-label': string;
    id: string;
  }
>((props, ref) => {
  const { completionItems, selectedItem, completionListOverride, onClickCompletionItem, getItemId, ...rest } = props;

  return (
    <div {...rest} ref={ref} css={styles.completionList} role={completionListOverride ? 'none' : 'listbox'}>
      {completionListOverride ??
        completionItems.map((completionItem, index) => (
          <CompletionElement
            id={getItemId(index)}
            key={index}
            completionItem={completionItem}
            isSelected={selectedItem === index}
            onClickCompletionItem={() => onClickCompletionItem(index)}
          />
        ))}
    </div>
  );
});
