// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import styled from '@emotion/styled';
import { jsx } from '@emotion/core';
import React, { useEffect, useMemo, useRef } from 'react';
import * as AdaptiveCards from 'adaptivecards';

const AdaptiveCardContainer = styled.div({
  padding: '0 32px',
  height: '500px',
});

const AdaptiveCardWrapper = styled.div({
  boxShadow: `0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)`,
  width: '375px',
  maxHeight: '500px',
  overflow: 'auto',
});

type Props = {
  card?: Record<string, any>;
};

export const AdaptiveCardRenderer: React.FC<Props> = ({ card }) => {
  const adaptiveCardRef = useRef<HTMLDivElement | null>(null);
  const adaptiveCard = useMemo(() => new AdaptiveCards.AdaptiveCard(), []);

  useEffect(() => {
    // Remove Adaptive Card from the Adaptive Card Container if there is a card already rendered
    const currentCard = adaptiveCardRef.current?.childNodes[0];
    if (currentCard) {
      adaptiveCardRef.current?.removeChild(currentCard);
    }

    if (card) {
      // Parse and render Adaptive Card
      adaptiveCard.parse(card);
      const renderedCard = adaptiveCard.render();

      if (renderedCard) {
        // Add Adaptive Card to the Adaptive Card Container
        adaptiveCardRef.current?.appendChild(renderedCard);
      }
    }
  }, [card]);

  return (
    <AdaptiveCardContainer>
      <AdaptiveCardWrapper ref={adaptiveCardRef} />
    </AdaptiveCardContainer>
  );
};
