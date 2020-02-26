// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';

import { ListOverview } from '../components/common/ListOverview';
import { ChoiceInputSize, ChoiceInputMarginTop } from '../constants/ElementSizes';
import { BorderedDiv } from '../components/elements/styledComponents';

export const ChoiceInputChoices = ({ choices }) => {
  if (!Array.isArray(choices)) {
    return null;
  }
  const ItemRender = ({ children }) => (
    <BorderedDiv
      role="choice"
      css={{
        height: ChoiceInputSize.height,
        width: ChoiceInputSize.width,
        marginTop: ChoiceInputMarginTop,
      }}
    >
      {children}
    </BorderedDiv>
  );
  return (
    <div data-testid="ChoiceInput" css={{ padding: '0 0 8px 8px' }}>
      <ListOverview
        items={choices.map(choice => choice.value)}
        ItemRender={ItemRender}
        maxCount={3}
        styles={{
          marginTop: ChoiceInputMarginTop,
        }}
      />
    </div>
  );
};
