// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import styled from '@emotion/styled';
import { jsx } from '@emotion/core';
import React, { useEffect, useMemo, useRef } from 'react';
import * as AdaptiveCards from 'adaptivecards';

import { CardTemplate } from './types';

const AdaptiveCardContainer = styled.div({
  padding: '0 32px',
  height: '500px',
});

const AdaptiveCardWrapper = styled.div({
  boxShadow: `0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)`,
  width: '400px',
  maxHeight: '500px',
  overflow: 'auto',
});

type Props = {
  template?: CardTemplate;
};

export const AdaptiveCardRenderer: React.FC<Props> = ({ template }) => {
  const adaptiveCardRef = useRef<HTMLDivElement | null>(null);
  const adaptiveCard = useMemo(() => new AdaptiveCards.AdaptiveCard(), []);

  useEffect(() => {
    if (template) {
      // Remove Adaptive Card from the Adaptive Card Container if there is a card already rendered
      const currentCard = adaptiveCardRef.current?.childNodes[0];

      if (currentCard) {
        adaptiveCardRef.current?.removeChild(currentCard);
      }

      // Parse and render Adaptive Card
      adaptiveCard.parse(template.body);
      const renderedCard = adaptiveCard.render();

      // Add Adaptive Card to the Adaptive Card Container
      adaptiveCardRef.current?.appendChild(renderedCard as Node);
    }
  }, [template]);

  return (
    <AdaptiveCardContainer>
      <AdaptiveCardWrapper ref={adaptiveCardRef} />
    </AdaptiveCardContainer>
  );
};
