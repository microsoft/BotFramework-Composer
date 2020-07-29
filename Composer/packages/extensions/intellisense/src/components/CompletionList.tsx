// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { CSSProperties } from 'react';
import { CompletionItem } from 'vscode-languageserver-types';
import CompletionElement from './CompletionElement';

const styles: Record<string, CSSProperties> = {
  completionList: {
    position: 'absolute',
    top: 32,
    left: 0,
    maxHeight: '300px',
    width: '100%',
    backgroundColor: 'white',
    overflowY: 'auto',
    overflowX: 'hidden',
    boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
    zIndex: 2000,
  },
};

const CompletionList = React.forwardRef<
  HTMLDivElement,
  {
    completionItems: CompletionItem[];
    selectedItem: number;
    onClickCompletionItem: (index: number) => void;
  }
>((props, ref) => {
  const { completionItems, selectedItem, onClickCompletionItem } = props;

  return (
    <div ref={ref} style={styles.completionList}>
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

export default CompletionList;
