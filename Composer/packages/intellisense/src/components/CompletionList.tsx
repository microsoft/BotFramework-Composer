// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import React from 'react';
import { CompletionItem } from 'vscode-languageserver-types';
import { css, jsx } from '@emotion/core';

import { CompletionElement } from './CompletionElement';

const styles = {
  completionList: css`
    position: absolute;
    top: 32;
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
    selectedItem: number;
    onClickCompletionItem: (index: number) => void;
  }
>((props, ref) => {
  const { completionItems, selectedItem, onClickCompletionItem } = props;

  return (
    <div ref={ref} css={styles.completionList}>
      {completionItems.map((completionItem, index) => (
        <CompletionElement
          key={index}
          completionItem={completionItem}
          isSelected={selectedItem === index}
          onClickCompletionItem={() => onClickCompletionItem(index)}
        />
      ))}
    </div>
  );
});
